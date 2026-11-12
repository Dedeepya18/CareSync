const User = require('../models/User');
const HealthMetric = require('../models/HealthMetric');
const Alert = require('../models/Alert');
const MedicalRecord = require('../models/MedicalRecord');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');

// @desc    Get admin platform analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalMetrics,
      totalAlerts,
      totalRecords,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      HealthMetric.countDocuments(),
      Alert.countDocuments(),
      MedicalRecord.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(8).select('-password'),
    ]);

    // Trend breakdown of alerts
    const alertsByType = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalMetrics,
        totalAlerts,
        totalRecords,
      },
      alertsByType,
      recentUsers,
      systemStatus: {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'MongoDB In-Memory / Atlas Connected',
        activeServices: ['TrendIntelligence', 'WellnessEngine', 'EmergencyTriage', 'ConsentManager'],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate administrator accounts.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

