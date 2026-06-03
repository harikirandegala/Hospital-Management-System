import { Department, Doctor, User } from '../models/index.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [{ model: Doctor, as: 'head', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
      order: [['name', 'ASC']]
    });
    res.json(departments);
  } catch (err) { next(err); }
};

export const createDepartment = async (req, res, next) => {
  try {
    const dept = await Department.create({ name: req.body.name, description: req.body.description });
    res.status(201).json(dept);
  } catch (err) { next(err); }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Department not found.' });
    if (req.body.name)          dept.name          = req.body.name;
    if (req.body.description)   dept.description   = req.body.description;
    if (req.body.head_doctor_id) dept.head_doctor_id = req.body.head_doctor_id;
    await dept.save();
    res.json(dept);
  } catch (err) { next(err); }
};
