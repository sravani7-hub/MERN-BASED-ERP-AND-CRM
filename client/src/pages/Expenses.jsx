import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import API from '../api/axios';

const { Title } = Typography;
const { Option } = Select;

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/expenses?limit=100');
      setExpenses(res.data.data);
    } catch (error) {
      message.error('Failed to fetch data');
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
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        date: dayjs(),
        category: 'office_supplies',
        status: 'pending',
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      const formattedValues = {
        ...values,
        date: values.date.toISOString(),
      };

      if (editingId) {
        await API.put(`/expenses/${editingId}`, formattedValues);
        message.success('Expense updated successfully');
      } else {
        await API.post('/expenses', formattedValues);
        message.success('Expense logged successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      message.success('Expense deleted successfully');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => `$${val?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="purple">{cat?.replace('_', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { pending: 'orange', approved: 'green', rejected: 'red' };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Delete this expense?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Expenses</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Log Expense
        </Button>
      </div>

      <Table dataSource={expenses} columns={columns} rowKey="_id" loading={loading} scroll={{ x: 800 }} />

      <Modal
        title={editingId ? 'Edit Expense' : 'Log Expense'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="E.g. Monthly Server Hosting" />
          </Form.Item>

          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
              <InputNumber placeholder="0.00" min={0.01} step={0.01} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select style={{ width: 200 }}>
                <Option value="office_supplies">Office Supplies</Option>
                <Option value="travel">Travel</Option>
                <Option value="software">Software</Option>
                <Option value="marketing">Marketing</Option>
                <Option value="utilities">Utilities</Option>
                <Option value="rent">Rent</Option>
                <Option value="salary">Salary</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select style={{ width: 200 }}>
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Additional details..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingId ? 'Update' : 'Log Expense'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Expenses;
