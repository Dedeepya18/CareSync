const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const Alert = require('../models/Alert');

// @desc    Add a medication
// @route   POST /api/medications
// @access  Private (Patient, Doctor)
exports.addMedication = async (req, res, next) => {
  try {
    const {
      name,
      dosage,
      frequency,
      route,
      purpose,
      instructions,
      startDate,
      endDate,
      reminderTimes,
      prescriberName,
    } = req.body;

    if (!name || !dosage) {
      return res.status(400).json({
        success: false,
        message: 'Medication name and dosage are required.',
      });
    }

    const patientId = req.body.patientId || req.user.id;

    const medication = await Medication.create({
      patient: patientId,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency || 'Once daily',
      route: route || 'Oral',
      purpose: purpose || '',
      instructions: instructions || 'Take with water after meals',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      reminderTimes: Array.isArray(reminderTimes) && reminderTimes.length ? reminderTimes : ['08:00'],
      prescriberName: prescriberName || '',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Medication added to schedule.',
      medication,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medications list
// @route   GET /api/medications
// @access  Private (Patient, Doctor with consent)
exports.getMedications = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user.id;
    const medications = await Medication.find({ patient: patientId }).sort({ isActive: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medications.length,
      medications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
exports.updateMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findOne({ _id: req.params.id, patient: req.user.id });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication record not found.',
      });
    }

    Object.assign(medication, req.body);
    await medication.save();

    res.status(200).json({
      success: true,
      message: 'Medication updated successfully.',
      medication,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
exports.deleteMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findOne({ _id: req.params.id, patient: req.user.id });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication record not found.',
      });
    }

    await medication.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medication removed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log medication dose taken/missed/skipped
// @route   POST /api/medications/:id/log
// @access  Private (Patient)
exports.logMedicationAction = async (req, res, next) => {
  try {
    const { status, scheduledDate, scheduledTime, notes } = req.body;
    const medicationId = req.params.id;

    if (!status || !['taken', 'missed', 'skipped'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (taken, missed, skipped) is required.',
      });
    }

    const medication = await Medication.findOne({ _id: medicationId, patient: req.user.id });
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found.',
      });
    }

    const dateStr = scheduledDate || new Date().toISOString().split('T')[0];
    const timeStr = scheduledTime || (medication.reminderTimes[0] || '08:00');

    // Update existing or create new log
    let log = await MedicationLog.findOne({
      medication: medicationId,
      patient: req.user.id,
      scheduledDate: dateStr,
      scheduledTime: timeStr,
    });

    if (log) {
      log.status = status;
      log.actionTime = new Date();
      if (notes) log.notes = notes;
      await log.save();
    } else {
      log = await MedicationLog.create({
        medication: medicationId,
        patient: req.user.id,
        scheduledDate: dateStr,
        scheduledTime: timeStr,
        status,
        actionTime: new Date(),
        notes: notes || '',
      });
    }

    res.status(200).json({
      success: true,
      message: `Medication marked as ${status}.`,
      log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medication adherence statistics
// @route   GET /api/medications/adherence
// @access  Private (Patient, Doctor with consent)
exports.getAdherenceStats = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user.id;
    const days = parseInt(req.query.days || '14', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await MedicationLog.find({
      patient: patientId,
      actionTime: { $gte: startDate },
    }).populate('medication', 'name dosage');

    const totalLogs = logs.length;
    const takenLogs = logs.filter(l => l.status === 'taken').length;
    const missedLogs = logs.filter(l => l.status === 'missed').length;
    const skippedLogs = logs.filter(l => l.status === 'skipped').length;

    const overallAdherence = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

    // Daily breakdown for charts
    const dailyMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const str = d.toISOString().split('T')[0];
      dailyMap[str] = { date: str, taken: 0, missed: 0, skipped: 0 };
    }

    logs.forEach(l => {
      if (dailyMap[l.scheduledDate]) {
        dailyMap[l.scheduledDate][l.status] += 1;
      }
    });

    const dailyChartData = Object.values(dailyMap);

    res.status(200).json({
      success: true,
      stats: {
        totalLogs,
        takenCount: takenLogs,
        missedCount: missedLogs,
        skippedCount: skippedLogs,
        adherencePercentage: overallAdherence,
        dailyChartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

