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
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import API from '../api/axios';

const { Title } = Typography;
const { Option } = Select;

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, custRes] = await Promise.all([
        API.get('/invoices?limit=100'),
        API.get('/customers?limit=100'),
      ]);
      setInvoices(invRes.data.data);
      setCustomers(custRes.data.data);
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
        customer: record.customer?._id || record.customer,
        dueDate: dayjs(record.dueDate),
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        status: 'unpaid',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
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
        dueDate: values.dueDate.toISOString(),
      };

      if (editingId) {
        await API.put(`/invoices/${editingId}`, formattedValues);
        message.success('Invoice updated successfully');
      } else {
        await API.post('/invoices', formattedValues);
        message.success('Invoice created successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/invoices/${id}`);
      message.success('Invoice deleted successfully');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => record.customer?.name || '-',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => `$${val?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          paid: 'green',
          unpaid: 'red',
          partial: 'orange',
          overdue: 'volcano',
          cancelled: 'default',
        };
        return <Tag color={colors[status]}>{status?.toUpperCase() || 'UNKNOWN'}</Tag>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Delete this invoice?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Invoices</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Create Invoice
        </Button>
      </div>

      <Table dataSource={invoices} columns={columns} rowKey="_id" loading={loading} scroll={{ x: 800 }} />

      <Modal
        title={editingId ? 'Edit Invoice' : 'Create Invoice'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="customer" label="Customer" rules={[{ required: true }]}>
            <Select placeholder="Select a customer">
              {customers.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Space size="large">
            <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select style={{ width: 200 }}>
                <Option value="paid">Paid</Option>
                <Option value="unpaid">Unpaid</Option>
                <Option value="partial">Partial</Option>
                <Option value="overdue">Overdue</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          </Space>

          <Title level={5} style={{ marginTop: 16 }}>Invoice Items</Title>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: 'Missing description' }]}
                    >
                      <Input placeholder="Item Description" style={{ width: 300 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Missing quantity' }]}
                    >
                      <InputNumber placeholder="Qty" min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unitPrice']}
                      rules={[{ required: true, message: 'Missing price' }]}
                    >
                      <InputNumber placeholder="Price" min={0} step={0.01} />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                    ) : null}
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Invoices;
