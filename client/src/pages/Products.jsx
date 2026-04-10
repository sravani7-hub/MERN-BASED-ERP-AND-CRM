import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import API from '../api/axios';

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get('/products?limit=100'),
        API.get('/categories'),
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
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
        category: record.category?._id || record.category,
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ stock: 0, costPrice: 0, isActive: true });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, values);
        message.success('Product updated successfully');
      } else {
        await API.post('/products', values);
        message.success('Product created successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      message.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    {
      title: 'Category',
      key: 'category',
      render: (_, record) => record.category?.name || '-',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (val) => `$${val?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => {
        let color = 'green';
        if (stock === 0) color = 'red';
        else if (stock <= 10) color = 'orange'; // Assuming 10 is low stock
        return <Tag color={color}>{stock}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Tag color={active ? 'blue' : 'default'}>{active ? 'ACTIVE' : 'INACTIVE'}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Products</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add Product
        </Button>
      </div>

      <Table dataSource={products} columns={columns} rowKey="_id" loading={loading} scroll={{ x: 800 }} />

      <Modal
        title={editingId ? 'Edit Product' : 'Add Product'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Space size="large" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="name" label="Product Name" rules={[{ required: true }]} style={{ width: 300 }}>
              <Input placeholder="Product name" />
            </Form.Item>
            <Form.Item name="sku" label="SKU (Optional)">
              <Input placeholder="Leave blank to auto-generate" style={{ width: 300 }} />
            </Form.Item>
          </Space>

          <Space size="large" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="price" label="Selling Price" rules={[{ required: true }]}>
              <InputNumber min={0} step={0.01} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="costPrice" label="Cost Price">
              <InputNumber min={0} step={0.01} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="stock" label="Initial Stock">
              <InputNumber min={0} style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Form.Item name="category" label="Category">
            <Select placeholder="Select category" allowClear>
              {categories.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingId ? 'Update' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
