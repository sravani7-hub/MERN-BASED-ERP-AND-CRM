import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
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

const { Title, Text } = Typography;
const { Option } = Select;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, custRes, prodRes] = await Promise.all([
        API.get('/orders?limit=100'),
        API.get('/customers?limit=100'),
        API.get('/products?limit=100'),
      ]);
      setOrders(ordRes.data.data);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
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
        deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
        products: record.products.map(p => ({
          product: p.product._id || p.product,
          productName: p.productName,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        })),
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        status: 'pending',
        products: [{ product: null, productName: '', quantity: 1, unitPrice: 0 }],
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleProductChange = (productId, name) => {
    const selected = products.find(p => p._id === productId);
    if (selected) {
      const items = form.getFieldValue('products') || [];
      items[name] = {
        ...items[name],
        productName: selected.name,
        unitPrice: selected.price,
      };
      form.setFieldsValue({ products: items });
    }
  };

  const onFinish = async (values) => {
    try {
      const formattedValues = {
        ...values,
        deliveryDate: values.deliveryDate ? values.deliveryDate.toISOString() : null,
      };

      if (editingId) {
        await API.put(`/orders/${editingId}`, formattedValues);
        message.success('Order updated successfully');
      } else {
        await API.post('/orders', formattedValues);
        message.success('Order created successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/orders/${id}`);
      message.success('Order deleted successfully');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
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
          pending: 'orange',
          confirmed: 'blue',
          processing: 'cyan',
          shipped: 'purple',
          delivered: 'green',
          cancelled: 'red',
          returned: 'default',
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Delete this order? Stock will be restored." onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Orders</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Create Order
        </Button>
      </div>

      <Table dataSource={orders} columns={columns} rowKey="_id" loading={loading} scroll={{ x: 800 }} />

      <Modal
        title={editingId ? 'Edit Order' : 'Create Order'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Space size="large" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="customer" label="Customer" rules={[{ required: true }]} style={{ width: 300 }}>
              <Select placeholder="Select a customer">
                {(customers || []).map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="deliveryDate" label="Delivery Date">
              <DatePicker style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select style={{ width: 200 }}>
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="processing">Processing</Option>
                <Option value="shipped">Shipped</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="cancelled">Cancelled</Option>
                <Option value="returned">Returned</Option>
              </Select>
            </Form.Item>
          </Space>

          <Title level={5} style={{ marginTop: 16 }}>Order Items</Title>
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'product']}
                      rules={[{ required: true, message: 'Missing product' }]}
                    >
                      <Select
                        placeholder="Select Product"
                        style={{ width: 250 }}
                        onChange={(val) => handleProductChange(val, name)}
                      >
                        {(products || []).map(p => (
                          <Option key={p._id} value={p._id}>
                            {p.name} (Stock: {p.stock})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'productName']}
                      hidden
                    >
                      <Input />
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
                    Add Product
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
              {editingId ? 'Update Order' : 'Create Order'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
