import React, { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import styles from './UserManagement.module.css';
import { useAuthContext } from '../../../Context/AuthContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import { User } from '../../../types/types';

const UserManagement: React.FC = () => {
  const { users, user, setUsers, setUser, manageUser } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const handleEdit = useCallback((userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      phone: userToEdit.phone,
      university: userToEdit.university,
      gender: userToEdit.gender,
      course: userToEdit.course,
      role: userToEdit.role,
    });
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingUser || !user) return;
    try {
      const updatedUser: User = {
        ...editingUser,
        name: DOMPurify.sanitize(formData.name || editingUser.name),
        email: DOMPurify.sanitize(formData.email || editingUser.email),
        phone: DOMPurify.sanitize(formData.phone || editingUser.phone),
        university: DOMPurify.sanitize(formData.university || editingUser.university),
        gender: formData.gender || editingUser.gender,
        course: formData.course ? DOMPurify.sanitize(formData.course) : editingUser.course,
        role: formData.role || editingUser.role,
        wishlist: editingUser.wishlist,
        enrolledCourses: editingUser.enrolledCourses,
        cart: editingUser.cart, // Preserve cart
        password: editingUser.password,
        token: editingUser.token,
        profilePicture: editingUser.profilePicture,
      };

      if (!['مرد', 'زن'].includes(updatedUser.gender)) {
        throw new Error('جنسیت باید "مرد" یا "زن" باشد.');
      }

      await manageUser(updatedUser.email, updatedUser);
      setUsers((prev: User[]) =>
        prev.map((u: User) =>
          u.email === updatedUser.email ? updatedUser : u
        )
      );
      if (user.email === updatedUser.email) {
        await setUser(updatedUser);
      }
      showNotification('کاربر با موفقیت به‌روزرسانی شد!', 'success');
      setEditingUser(null);
      setFormData({});
    } catch (error: any) {
      showNotification(error.message || 'خطایی در به‌روزرسانی کاربر رخ داد.', 'error');
    }
  }, [editingUser, user, formData, manageUser, setUsers, setUser, showNotification]);

  return (
    <div className={styles.userManagement}>
      <h2>مدیریت کاربران</h2>
      <table>
        <thead>
          <tr>
            <th>نام</th>
            <th>ایمیل</th>
            <th>نقش</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEdit(u)}>ویرایش</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingUser && (
        <div className={styles.editForm}>
          <h3>ویرایش کاربر: {editingUser.name}</h3>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="نام"
          />
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ایمیل"
          />
          <input
            type="text"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="تلفن"
          />
          <input
            type="text"
            value={formData.university || ''}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            placeholder="دانشگاه"
          />
          <select
            value={formData.gender || ''}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'مرد' | 'زن' })}
          >
            <option value="مرد">مرد</option>
            <option value="زن">زن</option>
          </select>
          <input
            type="text"
            value={formData.course || ''}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            placeholder="دوره"
          />
          <select
            value={formData.role || ''}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
          >
            <option value="Student">دانشجو</option>
            <option value="Instructor">استاد</option>
            <option value="Blogger">بلاگر</option>
            <option value="Admin">ادمین</option>
            <option value="SuperAdmin">سوپرادمین</option>
          </select>
          <button onClick={handleUpdate}>ذخیره</button>
          <button onClick={() => setEditingUser(null)}>لغو</button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;