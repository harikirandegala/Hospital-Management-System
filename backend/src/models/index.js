import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/database.js';

// ═══════════════════════════════════════════════════════════
//  USER  (base entity for all roles)
// ═══════════════════════════════════════════════════════════
export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true,
    validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin','doctor','nurse','receptionist','pharmacist','lab_tech','patient'),
    allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  avatar_url: { type: DataTypes.STRING(500) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login: { type: DataTypes.DATE },
  refresh_token: { type: DataTypes.TEXT }
});

// ═══════════════════════════════════════════════════════════
//  DEPARTMENT
// ═══════════════════════════════════════════════════════════
export const Department = sequelize.define('Department', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  head_doctor_id: { type: DataTypes.UUID }   // FK set below
});

// ═══════════════════════════════════════════════════════════
//  DOCTOR
// ═══════════════════════════════════════════════════════════
export const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  specialization: { type: DataTypes.STRING(150), allowNull: false },
  qualification: { type: DataTypes.STRING(200) },
  experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
  license_number: { type: DataTypes.STRING(50), unique: true },
  consultation_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  available_days: { type: DataTypes.ARRAY(DataTypes.STRING) },   // ['Mon','Tue',…]
  slot_duration_mins: { type: DataTypes.INTEGER, defaultValue: 30 }
});

// ═══════════════════════════════════════════════════════════
//  PATIENT
// ═══════════════════════════════════════════════════════════
export const Patient = sequelize.define('Patient', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  dob: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.ENUM('male','female','other') },
  blood_group: { type: DataTypes.ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') },
  address: { type: DataTypes.TEXT },
  emergency_contact_name: { type: DataTypes.STRING(100) },
  emergency_contact_phone: { type: DataTypes.STRING(20) },
  insurance_provider: { type: DataTypes.STRING(100) },
  insurance_policy_no: { type: DataTypes.STRING(100) },
  allergies: { type: DataTypes.ARRAY(DataTypes.STRING) }
});

// ═══════════════════════════════════════════════════════════
//  APPOINTMENT
// ═══════════════════════════════════════════════════════════
export const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.UUID, allowNull: false },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending','confirmed','in_progress','completed','cancelled','no_show'),
    defaultValue: 'pending' },
  type: { type: DataTypes.ENUM('in_person','telemedicine'), defaultValue: 'in_person' },
  reason: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
  cancelled_by: { type: DataTypes.UUID },
  cancellation_reason: { type: DataTypes.TEXT },
  reminder_sent: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  indexes: [
    { unique: true, fields: ['doctor_id', 'start_time'],   // prevent double-booking
      where: { status: { [Op.notIn]: ['cancelled', 'no_show'] } } }
  ]
});

// ═══════════════════════════════════════════════════════════
//  MEDICAL RECORD
// ═══════════════════════════════════════════════════════════
export const MedicalRecord = sequelize.define('MedicalRecord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.UUID, allowNull: false },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  appointment_id: { type: DataTypes.UUID },
  visit_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  chief_complaint: { type: DataTypes.TEXT },
  diagnosis: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
  vitals: { type: DataTypes.JSONB },  // { bp, pulse, temp, weight, height, spo2 }
  attachments: { type: DataTypes.ARRAY(DataTypes.STRING) }  // S3 URLs
});

// ═══════════════════════════════════════════════════════════
//  MEDICINE (pharmacy inventory)
// ═══════════════════════════════════════════════════════════
export const Medicine = sequelize.define('Medicine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  generic_name: { type: DataTypes.STRING(150) },
  category: { type: DataTypes.STRING(100) },
  dosage_form: { type: DataTypes.ENUM('tablet','capsule','syrup','injection','cream','drops','inhaler','other') },
  strength: { type: DataTypes.STRING(50) },
  manufacturer: { type: DataTypes.STRING(150) },
  stock_qty: { type: DataTypes.INTEGER, defaultValue: 0 },
  reorder_level: { type: DataTypes.INTEGER, defaultValue: 10 },
  unit_price: { type: DataTypes.DECIMAL(10, 2) },
  expiry_date: { type: DataTypes.DATEONLY }
});

// ═══════════════════════════════════════════════════════════
//  PRESCRIPTION
// ═══════════════════════════════════════════════════════════
export const Prescription = sequelize.define('Prescription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.UUID, allowNull: false },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  medical_record_id: { type: DataTypes.UUID },
  status: { type: DataTypes.ENUM('issued','dispensed','cancelled'), defaultValue: 'issued' },
  items: { type: DataTypes.JSONB, allowNull: false },
  // items: [{ medicine_id, name, dosage, frequency, duration, instructions }]
  notes: { type: DataTypes.TEXT }
});

// ═══════════════════════════════════════════════════════════
//  LAB ORDER
// ═══════════════════════════════════════════════════════════
export const LabOrder = sequelize.define('LabOrder', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.UUID, allowNull: false },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  medical_record_id: { type: DataTypes.UUID },
  test_name: { type: DataTypes.STRING(200), allowNull: false },
  test_type: { type: DataTypes.STRING(100) },  // blood, urine, imaging, etc.
  priority: { type: DataTypes.ENUM('routine','urgent','stat'), defaultValue: 'routine' },
  status: { type: DataTypes.ENUM('ordered','sample_collected','processing','completed','cancelled'),
    defaultValue: 'ordered' },
  ordered_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  result: { type: DataTypes.TEXT },
  result_file_url: { type: DataTypes.STRING(500) },
  processed_by: { type: DataTypes.UUID },
  processed_at: { type: DataTypes.DATE }
});

// ═══════════════════════════════════════════════════════════
//  INVOICE
// ═══════════════════════════════════════════════════════════
export const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  invoice_number: { type: DataTypes.STRING(50), unique: true },
  patient_id: { type: DataTypes.UUID, allowNull: false },
  appointment_id: { type: DataTypes.UUID },
  items: { type: DataTypes.JSONB },
  // items: [{ description, quantity, unit_price, amount }]
  subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('draft','issued','paid','partially_paid','overdue','cancelled'),
    defaultValue: 'draft' },
  due_date: { type: DataTypes.DATEONLY },
  insurance_claimed: { type: DataTypes.BOOLEAN, defaultValue: false },
  insurance_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  notes: { type: DataTypes.TEXT }
});

// ═══════════════════════════════════════════════════════════
//  ASSOCIATIONS
// ═══════════════════════════════════════════════════════════
Doctor.belongsTo(User,       { foreignKey: 'user_id', as: 'user' });
Doctor.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Patient.belongsTo(User,      { foreignKey: 'user_id', as: 'user' });
Department.belongsTo(Doctor, { foreignKey: 'head_doctor_id', as: 'head' });

Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(Doctor,  { foreignKey: 'doctor_id',  as: 'doctor'  });

MedicalRecord.belongsTo(Patient,     { foreignKey: 'patient_id' });
MedicalRecord.belongsTo(Doctor,      { foreignKey: 'doctor_id'  });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointment_id' });

Prescription.belongsTo(Patient,       { foreignKey: 'patient_id' });
Prescription.belongsTo(Doctor,        { foreignKey: 'doctor_id'  });
Prescription.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id' });

LabOrder.belongsTo(Patient,       { foreignKey: 'patient_id' });
LabOrder.belongsTo(Doctor,        { foreignKey: 'doctor_id'  });
LabOrder.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id' });

Invoice.belongsTo(Patient,     { foreignKey: 'patient_id'     });
Invoice.belongsTo(Appointment, { foreignKey: 'appointment_id' });

Patient.hasMany(Appointment,   { foreignKey: 'patient_id' });
Doctor.hasMany(Appointment,    { foreignKey: 'doctor_id'  });
Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id' });
Patient.hasMany(Prescription,  { foreignKey: 'patient_id' });
Patient.hasMany(LabOrder,      { foreignKey: 'patient_id' });
Patient.hasMany(Invoice,       { foreignKey: 'patient_id' });
