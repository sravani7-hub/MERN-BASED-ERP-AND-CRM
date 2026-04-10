import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Button, Dropdown, Avatar, theme } from 'antd';
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  WalletOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  DollarOutlined,
  BarChartOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { logout } from '../store/slices/authSlice';
import NotificationBell from '../components/NotificationBell';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/leads', icon: <UsergroupAddOutlined />, label: 'Leads' },
    { key: '/customers', icon: <TeamOutlined />, label: 'Customers (CRM)' },
    { key: '/quotes', icon: <FileTextOutlined />, label: 'Quotes' },
    { key: '/invoices', icon: <FileDoneOutlined />, label: 'Invoices' },
    { key: '/payments', icon: <CreditCardOutlined />, label: 'Payments' },
    { key: '/expenses', icon: <WalletOutlined />, label: 'Expenses' },
    { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
    { key: '/products', icon: <InboxOutlined />, label: 'Products' },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
    { key: '/employees', icon: <SolutionOutlined />, label: 'Employees' },
    { key: '/payroll', icon: <DollarOutlined />, label: 'Payroll' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notifications' },
  ];

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'My Profile',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? '1rem' : '1.5rem',
            fontWeight: 'bold',
            letterSpacing: 1,
            background: 'rgba(255,255,255,0.05)',
            marginBottom: 16,
            transition: 'all 0.3s',
          }}
        >
          {collapsed ? 'ERP' : 'ERP-CRM System'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px 0 0',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            zIndex: 9,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 500, color: '#333' }}>
              Welcome, {user?.name || 'User'}
            </span>
            <NotificationBell />
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Avatar
                style={{ backgroundColor: '#6c5ce7', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
