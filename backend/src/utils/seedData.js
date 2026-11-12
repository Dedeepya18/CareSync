const fs = require('fs');
const path = require('path');
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
const TrendIntelligenceService = require('../services/trendIntelligenceService');

const seedSampleData = async () => {
  const existingUsersCount = await User.countDocuments();
  if (existingUsersCount > 0) {
    console.log(`ℹ️ Database already contains ${existingUsersCount} users. Auto-seed skipped.`);
    return;
  }

  console.log('🌱 Seeding realistic clinical demonstration data for CareSync...');

  // Ensure uploads folder and dummy sample document exist
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const sampleDocPath = path.join(uploadDir, 'record-sample-blood-panel.pdf');
  if (!fs.existsSync(sampleDocPath)) {
    fs.writeFileSync(sampleDocPath, '%PDF-1.4\n1 0 obj\n<< /Title (CareSync Comprehensive Blood Panel) /Author (St Jude Diagnostic Labs) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
  }

  // 1. Create Admin
  const admin = await User.create({
    name: 'CareSync Admin',
    email: 'admin@caresync.health',
    password: 'AdminPassword123!',
    role: 'admin',
    phone: '+1 (555) 019-9000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  // 2. Create Doctors
  const doctorChenUser = await User.create({
    name: 'Dr. Emily Chen, MD',
    email: 'dr.chen@caresync.health',
    password: 'Password123!',
    role: 'doctor',
    phone: '+1 (555) 018-2020',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
  });

  const doctorChenProfile = await DoctorProfile.create({
    user: doctorChenUser._id,
    specialization: 'Cardiology & Preventive Medicine',
    licenseNumber: 'MD-NY-748921',
    experienceYears: 12,
    hospitalAffiliation: 'Metropolitan Heart & Vascular Institute',
    qualifications: ['MD (Cardiology - Johns Hopkins)', 'FACC', 'Board Certified Internal Medicine'],
    bio: 'Specialist in early detection of cardiovascular hypertension and personalized lifestyle interventions.',
    isVerified: true,
  });

  const doctorVanceUser = await User.create({
    name: 'Dr. Marcus Vance, MD',
    email: 'dr.vance@caresync.health',
    password: 'Password123!',
    role: 'doctor',
    phone: '+1 (555) 018-3030',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
  });

  await DoctorProfile.create({
    user: doctorVanceUser._id,
    specialization: 'Internal Medicine & Pulmonology',
    licenseNumber: 'MD-CA-819203',
    experienceYears: 15,
    hospitalAffiliation: 'Pacific Health Medical Center',
    qualifications: ['MD (Internal Medicine - Stanford)', 'FCCB'],
    bio: 'Dedicated to holistic preventive chronic disease management and proactive respiratory monitoring.',
    isVerified: true,
  });

  // 3. Create Patient: John Doe (Showcases Trend Intelligence Upward BP Trend!)
  const patientJohnUser = await User.create({
    name: 'John Doe',
    email: 'john@caresync.health',
    password: 'Password123!',
    role: 'patient',
    phone: '+1 (555) 012-4455',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  await PatientProfile.create({
    user: patientJohnUser._id,
    dateOfBirth: new Date('1980-06-15'),
    gender: 'male',
    bloodGroup: 'O+',
    heightCm: 178,
    weightKg: 82.5,
    emergencyContact: {
      name: 'Mary Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 012-4499',
    },
    allergies: ['Penicillin', 'Peanuts (Mild)'],
    chronicConditions: ['Stage 1 Essential Hypertension (Monitored)'],
    pastSurgeries: ['Appendectomy (2014)'],
    lifestyleHabits: {
      smoking: 'never',
      alcohol: 'socially',
      exerciseFrequency: '1-2 days/week',
      dietType: 'balanced',
    },
  });

  // 4. Generate 21 Days of Health Metrics for John Doe
  // Earlier 14 days: normal BP ~120/78, HR ~72.
  // Last 7 days: gradual upward trend to ~142/88! (Triggers explainable alert!)
  const sampleMetrics = [];
  for (let i = 21; i >= 0; i--) {
    const recordDate = new Date();
    recordDate.setDate(recordDate.getDate() - i);
    recordDate.setHours(8, 30, 0, 0);

    let sys = 120 + Math.floor(Math.random() * 4) - 2;
    let dia = 78 + Math.floor(Math.random() * 3) - 1;
    let hr = 71 + Math.floor(Math.random() * 4) - 2;
    let spo2 = 98 - (Math.random() > 0.8 ? 1 : 0);
    let glucose = 95 + Math.floor(Math.random() * 10);
    let sleep = 7.5 + (Math.random() * 0.8 - 0.4);

    if (i <= 6) {
      // Recent upward trend
      const increaseFactor = 7 - i;
      sys = 126 + increaseFactor * 2.8 + (Math.random() * 2);
      dia = 82 + increaseFactor * 1.0;
      hr = 76 + increaseFactor * 1.2;
      sleep = Math.max(5.2, 7.0 - increaseFactor * 0.25);
    }

    sampleMetrics.push({
      patient: patientJohnUser._id,
      recordedAt: recordDate,
      systolicBP: Math.round(sys),
      diastolicBP: Math.round(dia),
      heartRate: Math.round(hr),
      spO2: spo2,
      bloodGlucose: glucose,
      bloodGlucoseType: 'fasting',
      temperature: 36.6 + Number((Math.random() * 0.3).toFixed(1)),
      weight: 82.5 + Number((i * 0.05).toFixed(1)),
      sleepHours: Number(sleep.toFixed(1)),
      sleepQuality: i <= 5 ? 'fair' : 'good',
      notes: i === 0 ? 'Recorded after morning walk and light hydration' : '',
      source: 'manual',
    });
  }
  await HealthMetric.insertMany(sampleMetrics);

  // 5. Create Medications for John Doe
  const lisinopril = await Medication.create({
    patient: patientJohnUser._id,
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    route: 'Oral',
    purpose: 'Cardiovascular blood pressure management',
    instructions: 'Take 1 tablet every morning with breakfast',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    reminderTimes: ['08:00'],
    prescriberName: 'Dr. Emily Chen',
    isActive: true,
  });

  const atorvastatin = await Medication.create({
    patient: patientJohnUser._id,
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    route: 'Oral',
    purpose: 'Cholesterol & vascular preventive health',
    instructions: 'Take 1 tablet at bedtime',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    reminderTimes: ['21:00'],
    prescriberName: 'Dr. Emily Chen',
    isActive: true,
  });

  // 6. Create Medication Logs for the last 14 days
  const medLogs = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Lisinopril morning dose (mostly taken, occasional missed)
    const lisinoprilStatus = i === 3 ? 'missed' : 'taken';
    medLogs.push({
      medication: lisinopril._id,
      patient: patientJohnUser._id,
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      status: lisinoprilStatus,
      actionTime: d,
    });

    // Atorvastatin evening dose
    const atorvStatus = i === 5 ? 'skipped' : 'taken';
    medLogs.push({
      medication: atorvastatin._id,
      patient: patientJohnUser._id,
      scheduledDate: dateStr,
      scheduledTime: '21:00',
      status: atorvStatus,
      actionTime: d,
    });
  }
  await MedicationLog.insertMany(medLogs);

  // 7. Create Symptoms for John Doe
  await Symptom.create([
    {
      patient: patientJohnUser._id,
      symptomName: 'Mild Morning Headache',
      severity: 4,
      duration: '2 hours',
      onsetDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      bodyLocation: 'Frontal / Forehead',
      notes: 'Noticed dull tension upon waking. Resolved after drinking water.',
      status: 'resolved',
      triggers: ['Poor sleep', 'Mild dehydration'],
    },
    {
      patient: patientJohnUser._id,
      symptomName: 'Lightheadedness upon Standing',
      severity: 3,
      duration: '5 minutes',
      onsetDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      bodyLocation: 'Head / Postural',
      notes: 'Brief dizzy sensation when getting out of bed quickly.',
      status: 'improving',
      triggers: ['Rapid positional change'],
    },
  ]);

  // 8. Create Medical Record for John Doe
  await MedicalRecord.create({
    patient: patientJohnUser._id,
    title: 'Comprehensive Lipid & Metabolic Blood Panel',
    documentType: 'lab_report',
    originalFilename: 'Annual_Blood_Panel_2026.pdf',
    filePath: '/uploads/record-sample-blood-panel.pdf',
    fileSize: 245760,
    mimeType: 'application/pdf',
    uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    description: 'Annual fasting blood work including lipid profile, HbA1c, and renal electrolytes.',
    tags: ['Blood Test', 'Lipids', 'HbA1c', 'Metabolic'],
    issuingDoctorOrClinic: 'St. Jude Diagnostic Laboratories',
  });

  // 9. Grant Consent to Dr. Emily Chen
  await Consent.create({
    patient: patientJohnUser._id,
    doctor: doctorChenUser._id,
    status: 'active',
    permissions: {
      shareVitals: true,
      shareMedications: true,
      shareSymptoms: true,
      shareMedicalRecords: true,
      shareDoctorNotes: true,
    },
    grantedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    notes: 'Consent granted for ongoing cardiovascular and blood pressure tele-monitoring.',
  });

  // 10. Add Clinical Doctor Note from Dr. Chen
  await DoctorNote.create({
    doctor: doctorChenUser._id,
    patient: patientJohnUser._id,
    title: 'Bi-Weekly Telehealth Review & Lifestyle Guidance',
    observation: 'Patient shows consistent home logging. Recent 7-day systolic average has trended upward from 121 to ~140 mmHg. Heart rate remains stable at 75-80 bpm.',
    generalGuidance: 'Reduce dietary sodium intake below 2,000 mg/day. Maintain brisk 30-minute daily walks. Keep monitoring morning and evening readings.',
    recommendedTests: ['24-Hour Ambulatory BP Monitoring if trend continues', 'Serum Electrolytes'],
    followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isSharedWithPatient: true,
  });

  // 11. Run Trend Intelligence Service to generate realistic Explainable Alert!
  await TrendIntelligenceService.analyzePatientTrends(patientJohnUser._id);

  // 12. Create Notifications for John Doe
  await Notification.create([
    {
      user: patientJohnUser._id,
      title: 'Health Trend Notice',
      message: 'CareSync Trend Intelligence detected an upward pattern in your systolic blood pressure over recent logs.',
      type: 'alert',
      link: '/alerts',
      isRead: false,
    },
    {
      user: patientJohnUser._id,
      title: 'Doctor Note Available',
      message: 'Dr. Emily Chen added guidance regarding your recent blood pressure trends.',
      type: 'system',
      link: '/health-profile',
      isRead: true,
    },
  ]);

  // 13. Create Second Patient (Sarah Jenkins)
  const patientSarahUser = await User.create({
    name: 'Sarah Jenkins',
    email: 'sarah@caresync.health',
    password: 'Password123!',
    role: 'patient',
    phone: '+1 (555) 014-7788',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  });

  await PatientProfile.create({
    user: patientSarahUser._id,
    dateOfBirth: new Date('1992-03-22'),
    gender: 'female',
    bloodGroup: 'A+',
    heightCm: 165,
    weightKg: 61.0,
    emergencyContact: {
      name: 'David Jenkins',
      relationship: 'Brother',
      phone: '+1 (555) 014-7799',
    },
    allergies: ['Dust Mites', 'Sulfa Drugs'],
    chronicConditions: ['Mild Allergic Asthma'],
    lifestyleHabits: {
      smoking: 'never',
      alcohol: 'never',
      exerciseFrequency: '3-4 days/week',
      dietType: 'vegetarian',
    },
  });

  // Sarah's metrics (Normal stable vitals)
  const sarahMetrics = [];
  for (let i = 10; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    sarahMetrics.push({
      patient: patientSarahUser._id,
      recordedAt: d,
      systolicBP: 114 + Math.floor(Math.random() * 4),
      diastolicBP: 74 + Math.floor(Math.random() * 3),
      heartRate: 68 + Math.floor(Math.random() * 4),
      spO2: 97 + (i % 2 === 0 ? 1 : 0),
      bloodGlucose: 88 + Math.floor(Math.random() * 6),
      sleepHours: 7.8,
      sleepQuality: 'good',
      source: 'manual',
    });
  }
  await HealthMetric.insertMany(sarahMetrics);

  console.log('✅ Realistic CareSync demonstration data seeded successfully!');
  console.log('---------------------------------------------------------');
  console.log('🔑 DEMO LOGIN CREDENTIALS:');
  console.log('   👨‍💼 Admin:   admin@caresync.health   / AdminPassword123!');
  console.log('   👩‍⚕️ Doctor:  dr.chen@caresync.health  / Password123!');
  console.log('   👨‍⚕️ Doctor:  dr.vance@caresync.health / Password123!');
  console.log('   🧑 Patient: john@caresync.health     / Password123! (Contains Upward Trend Alert!)');
  console.log('   👩 Patient: sarah@caresync.health    / Password123! (Stable Normal Vitals)');
  console.log('---------------------------------------------------------');
};

module.exports = seedSampleData;

