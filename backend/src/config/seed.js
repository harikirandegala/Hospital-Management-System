import { config } from 'dotenv';
config();

import bcrypt from 'bcryptjs';
import { sequelize } from './database.js';
import { User, Department, Doctor, Patient } from '../models/index.js';

async function seed() {
  await sequelize.sync({ force: true });
  console.log('🗃️  Tables recreated.');

  const hash = (p) => bcrypt.hash(p, 12);

  // ── Departments ─────────────────────────────────────────
  const [cardiology, neurology, ortho, general, paediatrics] = await Department.bulkCreate([
    { name: 'Cardiology',     description: 'Heart & cardiovascular care' },
    { name: 'Neurology',      description: 'Brain & nervous system' },
    { name: 'Orthopaedics',   description: 'Bones, joints & muscles' },
    { name: 'General Medicine', description: 'General adult care' },
    { name: 'Paediatrics',    description: 'Child health & development' },
  ]);
  console.log('✅ Departments seeded.');

  // ── Admin user ───────────────────────────────────────────
  await User.create({
    name: 'System Admin', email: 'admin@hospital.com',
    password_hash: await hash('password123'), role: 'admin', phone: '+91 9000000001'
  });

  // ── Doctors ───────────────────────────────────────────────
  const doc1User = await User.create({ name: 'Priya Sharma', email: 'priya@hospital.com',
    password_hash: await hash('password123'), role: 'doctor', phone: '+91 9000000002' });
  const doc2User = await User.create({ name: 'Arjun Reddy', email: 'arjun@hospital.com',
    password_hash: await hash('password123'), role: 'doctor', phone: '+91 9000000003' });
  const doc3User = await User.create({ name: 'Meera Nair', email: 'meera@hospital.com',
    password_hash: await hash('password123'), role: 'doctor', phone: '+91 9000000004' });

  await Doctor.bulkCreate([
    { user_id: doc1User.id, department_id: cardiology.id, specialization: 'Interventional Cardiologist',
      qualification: 'MD, DM Cardiology', experience_years: 12, license_number: 'MCI-2012-001',
      consultation_fee: 800, available_days: ['Mon','Tue','Wed','Thu','Fri'], slot_duration_mins: 30 },
    { user_id: doc2User.id, department_id: neurology.id, specialization: 'Neurologist',
      qualification: 'MD, DM Neurology', experience_years: 8, license_number: 'MCI-2016-002',
      consultation_fee: 700, available_days: ['Mon','Wed','Fri'], slot_duration_mins: 45 },
    { user_id: doc3User.id, department_id: general.id, specialization: 'General Physician',
      qualification: 'MBBS, MD General Medicine', experience_years: 6, license_number: 'MCI-2018-003',
      consultation_fee: 500, available_days: ['Mon','Tue','Wed','Thu','Fri','Sat'], slot_duration_mins: 20 },
  ]);
  console.log('✅ Doctors seeded.');

  // ── Staff ─────────────────────────────────────────────────
  await User.bulkCreate([
    { name: 'Kavitha R', email: 'kavitha@hospital.com',
      password_hash: await hash('password123'), role: 'receptionist', phone: '+91 9000000005' },
    { name: 'Suresh Lab', email: 'suresh@hospital.com',
      password_hash: await hash('password123'), role: 'lab_tech', phone: '+91 9000000006' },
    { name: 'Rekha Pharmacy', email: 'rekha@hospital.com',
      password_hash: await hash('password123'), role: 'pharmacist', phone: '+91 9000000007' },
  ]);

  // ── Patients ──────────────────────────────────────────────
  const p1User = await User.create({ name: 'Hari Kumar', email: 'hari@example.com',
    password_hash: await hash('password123'), role: 'patient', phone: '+91 9876543210' });
  const p2User = await User.create({ name: 'Lakshmi Devi', email: 'lakshmi@example.com',
    password_hash: await hash('password123'), role: 'patient', phone: '+91 9876543211' });

  await Patient.bulkCreate([
    { user_id: p1User.id, dob: '1995-04-15', gender: 'male', blood_group: 'B+',
      address: 'Visakhapatnam, AP', emergency_contact_name: 'Radha Kumar',
      emergency_contact_phone: '+91 9876000001', allergies: ['Penicillin'] },
    { user_id: p2User.id, dob: '1988-11-02', gender: 'female', blood_group: 'O+',
      address: 'Chennai, TN', emergency_contact_name: 'Ravi Devi',
      emergency_contact_phone: '+91 9876000002', allergies: [] },
  ]);
  console.log('✅ Patients seeded.');

  console.log('\n🎉 Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  Admin:       admin@hospital.com    / password123');
  console.log('  Doctor:      priya@hospital.com    / password123');
  console.log('  Patient:     hari@example.com      / password123');
  console.log('  Receptionist: kavitha@hospital.com / password123');

  await sequelize.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
