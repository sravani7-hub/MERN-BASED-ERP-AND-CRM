import { Table, Tag, Button, Space, Input, Card, Row, Col, Statistic } from 'antd';
import { SearchOutlined, InboxOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

const data = [
  { key: '1', sku: 'PRD-001', name: 'Wireless Mouse',     warehouse: 'Warehouse A', qty: 450, reorder: 50,  status: 'In Stock' },
  { key: '2', sku: 'PRD-002', name: 'Mechanical Keyboard', warehouse: 'Warehouse A', qty: 120, reorder: 30,  status: 'In Stock' },
  { key: '3', sku: 'PRD-003', name: 'USB-C Hub',           warehouse: 'Warehouse B', qty: 0,   reorder: 25,  status: 'Out of Stock' },
  { key: '4', sku: 'PRD-005', name: 'Webcam HD',           warehouse: 'Warehouse A', qty: 12,  reorder: 20,  status: 'Low Stock' },
];

const statusColors = { 'In Stock': 'green', 'Out of Stock': 'red', 'Low Stock': 'orange' };

const columns = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: 'Product', dataIndex: 'name', key: 'name' },
  { title: 'Warehouse', dataIndex: 'warehouse', key: 'warehouse' },
  { title: 'Quantity', dataIndex: 'qty', key: 'qty', sorter: (a, b) => a.qty - b.qty },
  { title: 'Reorder Level', dataIndex: 'reorder', key: 'reorder' },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
  { title: 'Action', key: 'action', render: () => <Space><Button type="link" size="small">Adjust</Button><Button type="link" size="small">History</Button></Space> },
];

const Inventory = () => (
  <>
    <div className="page-header">
      <h1>Inventory</h1>
      <p>Real-time stock levels and warehouse management.</p>
    </div>
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      <Col xs={24} sm={8}><Card className="glass-card"><Statistic title="Total Items" value={4720} prefix={<InboxOutlined />} valueStyle={{ color: '#6c5ce7' }} /></Card></Col>
      <Col xs={24} sm={8}><Card className="glass-card"><Statistic title="In Stock" value={4312} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#00b894' }} /></Card></Col>
      <Col xs={24} sm={8}><Card className="glass-card"><Statistic title="Low / Out" value={18} prefix={<WarningOutlined />} valueStyle={{ color: '#e17055' }} /></Card></Col>
    </Row>
    <div style={{ marginBottom: 16 }}>
      <Input placeholder="Search inventory…" prefix={<SearchOutlined />} style={{ width: 280 }} />
    </div>
    <Table columns={columns} dataSource={data} className="glass-card" pagination={{ pageSize: 10 }} />
  </>
);

export default Inventory;
