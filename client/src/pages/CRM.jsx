import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import API from '../api/axios';

const { Title } = Typography;

const CRM = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/customers?limit=100');
      setCustomers(res.data.data);
    } catch (error) {
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (record = null) => {
    setIsModalVisible(true);
    if (record) {
      setEditingId(record._id);
      form.setFieldsValue({ ...record });
    } else {
      setEditingId(null);
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      if (editingId) {
        await API.put(`/customers/${editingId}`, values);
        message.success('Customer updated successfully');
      } else {
        await API.post('/customers', values);
        message.success('Customer added successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/customers/${id}`);
      message.success('Customer deleted');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Delete this customer?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Customer Relationship Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add Customer
        </Button>
      </div>

      <Table dataSource={customers} columns={columns} rowKey="_id" loading={loading} scroll={{ x: 800 }} />

      <Modal
        title={editingId ? 'Edit Customer' : 'Add Customer'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]} style={{ width: 220 }}>
              <Input />
            </Form.Item>
            <Form.Item name="company" label="Company" style={{ width: 220 }}>
              <Input />
            </Form.Item>
          </Space>
          
          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]} style={{ width: 220 }}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" style={{ width: 220 }}>
              <Input />
            </Form.Item>
          </Space>

          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Customer preferences, history, etc..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingId ? 'Update' : 'Save'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CRM;
