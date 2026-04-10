import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Alert, Typography } from 'antd';
import {
  UsergroupAddOutlined,
  TeamOutlined,
  FileDoneOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import API from '../api/axios';

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats and sales report concurrently
        const [statsRes, salesRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/reports/sales'),
        ]);

        setStats(statsRes.data.data);
        setSalesData(salesRes.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
        <Spin size="large" tip="Loading Dashboard Analytics..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={2} style={{ marginTop: 0, marginBottom: 24, color: '#333' }}>
        Dashboard Overview
      </Title>

      {/* ─── Top Stats Cards ──────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Total Leads"
              value={stats?.leads}
              prefix={<UsergroupAddOutlined style={{ color: '#0984e3' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Customers"
              value={stats?.customers}
              prefix={<TeamOutlined style={{ color: '#00b894' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Invoices"
              value={stats?.invoices}
              prefix={<FileDoneOutlined style={{ color: '#e17055' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Orders"
              value={stats?.orders}
              prefix={<ShoppingCartOutlined style={{ color: '#fdcb6e' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Employees"
              value={stats?.employees}
              prefix={<SolutionOutlined style={{ color: '#6c5ce7' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Total Revenue"
              value={stats?.revenue}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#00cec9' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Charts Section ───────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Sales Overview (Monthly)"
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12, height: '100%' }}
          >
            {salesData.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', padding: '50px 0' }}>
                No sales data available yet.
              </div>
            ) : (
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      formatter={(value) => [`$${value}`, 'Amount']}
                      cursor={{ fill: 'rgba(108, 92, 231, 0.1)' }}
                    />
                    <Bar
                      dataKey="totalPaid"
                      name="Paid Revenue"
                      fill="#6c5ce7"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                    <Bar
                      dataKey="totalSales"
                      name="Expected Sales"
                      fill="#a29bfe"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Quick Info"
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12, height: '100%' }}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: 4 }}>
                Unpaid / Expected Revenue
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d63031' }}>
                ${(stats?.expectedRevenue - stats?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(108, 92, 231, 0.05)', borderRadius: 8 }}>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                System Status
              </Typography.Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00b894' }} />
                <span>API Connected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00b894' }} />
                <span>Database Online</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
