const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/auth');
const customerService = require('../services/customerService');

const router = express.Router();

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
});

router.get('/', requireRole('viewer', 'staff'), (_req, res) => {
  res.json(customerService.listCustomers());
});

router.get('/:id', requireRole('viewer', 'staff'), (req, res) => {
  const customer = customerService.getCustomerById(Number(req.params.id));
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  const history = customerService.getPurchaseHistory(Number(req.params.id));
  res.json({ customer, history });
});

router.post('/', requireRole('staff'), (req, res) => {
  try {
    const payload = customerSchema.parse(req.body);
    const customer = customerService.createCustomer(payload);
    res.status(201).json(customer);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.message, issues: err.issues });
    }
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', requireRole('staff'), (req, res) => {
  try {
    const payload = customerSchema.parse(req.body);
    const customer = customerService.updateCustomer(Number(req.params.id), payload);
    res.json(customer);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.message, issues: err.issues });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  customerService.deleteCustomer(Number(req.params.id));
  res.status(204).send();
});

module.exports = router;
