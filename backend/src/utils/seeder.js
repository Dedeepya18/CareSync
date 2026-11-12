const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const seedSampleData = require('./seedData');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const HealthMetric = require('../models/HealthMetric');
const Symptom = require('../models/Symptom');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const MedicalRecord = require('../models/MedicalRecord');
const Alert = require('../models/Alert');
const DoctorNote = require('../models/DoctorNote');
const Consent = require('../models/Consent');
const Notification = require('../models/Notification');

const run = async () => {
  try {
    await connectDB();

    if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
      console.log('🗑️ Purging all CareSync collections...');
      await Promise.all([
        User.deleteMany(),
        PatientProfile.deleteMany(),
        DoctorProfile.deleteMany(),
        HealthMetric.deleteMany(),
        Symptom.deleteMany(),
        Medication.deleteMany(),
        MedicationLog.deleteMany(),
        MedicalRecord.deleteMany(),
        Alert.deleteMany(),
        DoctorNote.deleteMany(),
        Consent.deleteMany(),
        Notification.deleteMany(),
      ]);
      console.log('✅ All data purged.');
    } else {
      await seedSampleData();
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Seeder execution error:', error);
    process.exit(1);
  }
};

run();

