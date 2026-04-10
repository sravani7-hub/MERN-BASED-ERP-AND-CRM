import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { registerUser, clearError } from '../store/slices/authSlice';

const { Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onFinish = (values) => {
    dispatch(
      registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      })
    );
  };

  return (
    <>
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => dispatch(clearError())}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label={<span style={{ color: '#ccc', fontWeight: 500 }}>Full Name</span>}
          rules={[
            { required: true, message: 'Please enter your name' },
            { min: 2, message: 'Name must be at least 2 characters' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#6c5ce7' }} />}
            placeholder="John Doe"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(108,92,231,0.2)',
              borderRadius: 10,
              height: 48,
            }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span style={{ color: '#ccc', fontWeight: 500 }}>Email</span>}
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#6c5ce7' }} />}
            placeholder="you@example.com"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(108,92,231,0.2)',
              borderRadius: 10,
              height: 48,
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ color: '#ccc', fontWeight: 500 }}>Password</span>}
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#6c5ce7' }} />}
            placeholder="Min. 6 characters"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(108,92,231,0.2)',
              borderRadius: 10,
              height: 48,
            }}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span style={{ color: '#ccc', fontWeight: 500 }}>Confirm Password</span>}
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#6c5ce7' }} />}
            placeholder="Re-enter password"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(108,92,231,0.2)',
              borderRadius: 10,
              height: 48,
            }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12, marginTop: 28 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 48,
              borderRadius: 10,
              fontWeight: 600,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(108, 92, 231, 0.4)',
            }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ borderColor: 'rgba(108,92,231,0.15)', margin: '16px 0' }}>
        <Text style={{ color: '#666', fontSize: '0.8rem' }}>OR</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Text style={{ color: '#888' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#a29bfe',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </Text>
      </div>
    </>
  );
};

export default Register;
