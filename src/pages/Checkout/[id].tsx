import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCourseContext } from '../../Context/CourseContext';
import { useAuthContext } from '../../Context/AuthContext';

interface Course {
  id: number;
  title: string;
  price: string;
  instructor: string;
  description: string;
}

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses } = useCourseContext();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    paymentMethod: 'card',
  });
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

  useEffect(() => {
    const courseId = parseInt(id || '0');
    const foundCourse = courses.find((c) => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
      setLoading(false);
    } else {
      setError('Course not found.');
      setLoading(false);
    }
  }, [id, courses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/checkout/${id}` } });
      return;
    }
    // Simulate enrollment process
    setLoading(true);
    setTimeout(() => {
      setEnrollmentStatus('Enrollment successful!');
      setLoading(false);
      setTimeout(() => navigate('/courses'), 2000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert severity="error">{error || 'Course not found.'}</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Enroll in {course.title}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Course Details</h2>
        <p className="mb-2"><strong>Title:</strong> {course.title}</p>
        <p className="mb-2"><strong>Instructor:</strong> {course.instructor}</p>
        <p className="mb-2"><strong>Price:</strong> {course.price}</p>
        <p className="mb-4"><strong>Description:</strong> {course.description}</p>

        {!isAuthenticated ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              select
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="card">Credit Card</option>
              <option value="paypal">PayPal</option>
            </TextField>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate('/login', { state: { from: `/checkout/${id}` } })}
              className="mt-4"
            >
              Login to Enroll
            </Button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Confirm Enrollment</h2>
            <p className="mb-4">You are about to enroll in {course.title}. Click below to confirm.</p>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleEnroll}
              disabled={loading}
              className="mt-4"
            >
              {loading ? 'Processing...' : 'Confirm Enrollment'}
            </Button>
          </div>
        )}
        {enrollmentStatus && (
          <Alert severity="success" className="mt-4">
            {enrollmentStatus}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Checkout;