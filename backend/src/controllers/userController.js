const { queryWithTiming } = require('../config/database');

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await queryWithTiming(
      'SELECT id, username, email, full_name, phone, theme_preference, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        theme_preference: user.theme_preference,
        is_active: user.is_active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching profile'
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { full_name, phone, email, theme_preference } = req.body;

    await queryWithTiming(
      'UPDATE users SET full_name = ?, phone = ?, email = ?, theme_preference = ?, updated_at = datetime("now") WHERE id = ?',
      [full_name, phone, email, theme_preference, userId]
    );

    // Get updated user
    const result = await queryWithTiming(
      'SELECT id, username, email, full_name, phone, theme_preference, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating profile'
    });
  }
};

/**
 * Change user password - disabled since authentication is bypassed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  return res.status(501).json({
    success: false,
    error: 'Password change is disabled in bypass mode'
  });
};

/**
 * Get user activity log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActivityLog = async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 50 } = req.query;

    const result = await queryWithTiming(
      'SELECT * FROM audit_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, parseInt(limit)]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching activity log'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getActivityLog
};
