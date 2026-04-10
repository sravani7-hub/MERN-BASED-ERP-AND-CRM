import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { loginUser, clearError } from '../store/slices/authSlice';

const { Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Where to go after login (default: dashboard)
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onFinish = (values) => {
    dispatch(loginUser({ email: values.email, password: values.password }));
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
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
        requiredMark={false}
      >
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
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#6c5ce7' }} />}
            placeholder="••••••••"
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
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ borderColor: 'rgba(108,92,231,0.15)', margin: '16px 0' }}>
        <Text style={{ color: '#666', fontSize: '0.8rem' }}>OR</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Text style={{ color: '#888' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#a29bfe',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create one
          </Link>
        </Text>
      </div>
    </>
  );
};

export default Login;
