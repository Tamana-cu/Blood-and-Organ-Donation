import { Router, Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { authMiddleware } from '../utils/auth';

const router = Router();

// Get all notifications for current user
router.get(
  '/',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const notifications = await Notification.find({ userId: req.user._id }).sort({
        createdAt: -1,
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Mark notification as read
router.put(
  '/:id/read',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }

      res.json(notification);
    } catch (error) {
      res.status(500).json({
        message: 'Error updating notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Mark all as read
router.put(
  '/read-all',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      await Notification.updateMany({ userId: req.user._id }, { isRead: true });
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Delete notification
router.delete(
  '/:id',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }

      res.json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
