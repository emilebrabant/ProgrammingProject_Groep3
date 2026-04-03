import express from 'express';
import { createUser, deleteUser, getUsers, updateUser, updateUserRole } from '../controllers/userController.js';
import { heeftRol } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', heeftRol(['admin']), getUsers);
router.post('/', heeftRol(['admin']), createUser);
router.patch('/:id', heeftRol(['admin']), updateUser);
router.patch('/:id/role', heeftRol(['admin']), updateUserRole);
router.delete('/:id', heeftRol(['admin']), deleteUser);

export default router;