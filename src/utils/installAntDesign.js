/**
 * Ant Design Vue 按需注册清单。
 * 这里只安装模板中真实使用的全局 a-* 组件，避免非轻量路由下载完整组件库。
 */
import Alert from 'ant-design-vue/es/alert'
import AutoComplete from 'ant-design-vue/es/auto-complete'
import Avatar from 'ant-design-vue/es/avatar'
import Badge from 'ant-design-vue/es/badge'
import Button from 'ant-design-vue/es/button'
import Card from 'ant-design-vue/es/card'
import Checkbox from 'ant-design-vue/es/checkbox'
import DatePicker from 'ant-design-vue/es/date-picker'
import Descriptions from 'ant-design-vue/es/descriptions'
import Divider from 'ant-design-vue/es/divider'
import Drawer from 'ant-design-vue/es/drawer'
import Dropdown from 'ant-design-vue/es/dropdown'
import Empty from 'ant-design-vue/es/empty'
import Form from 'ant-design-vue/es/form'
import Image from 'ant-design-vue/es/image'
import Input from 'ant-design-vue/es/input'
import InputNumber from 'ant-design-vue/es/input-number'
import Layout from 'ant-design-vue/es/layout'
import Menu from 'ant-design-vue/es/menu'
import Modal from 'ant-design-vue/es/modal'
import Pagination from 'ant-design-vue/es/pagination'
import Popconfirm from 'ant-design-vue/es/popconfirm'
import Popover from 'ant-design-vue/es/popover'
import Progress from 'ant-design-vue/es/progress'
import Result from 'ant-design-vue/es/result'
import Segmented from 'ant-design-vue/es/segmented'
import Select from 'ant-design-vue/es/select'
import Skeleton from 'ant-design-vue/es/skeleton'
import Slider from 'ant-design-vue/es/slider'
import Space from 'ant-design-vue/es/space'
import Spin from 'ant-design-vue/es/spin'
import Steps from 'ant-design-vue/es/steps'
import Switch from 'ant-design-vue/es/switch'
import Table from 'ant-design-vue/es/table'
import Tabs from 'ant-design-vue/es/tabs'
import Tag from 'ant-design-vue/es/tag'
import Tooltip from 'ant-design-vue/es/tooltip'
import Upload from 'ant-design-vue/es/upload'
import { Col, Row } from 'ant-design-vue/es/grid'

// 具备 install 钩子的组件由 app.use 统一注册，其子组件会随父组件一起安装。
const INSTALLABLE_COMPONENTS = [
  Alert,
  AutoComplete,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Result,
  Segmented,
  Select,
  Skeleton,
  Slider,
  Space,
  Spin,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Upload,
]

/** 按当前代码清单安装全局组件；Row/Col 没有插件钩子，需要单独注册。 */
export function installAntDesign(app) {
  INSTALLABLE_COMPONENTS.forEach((component) => app.use(component))
  app.component(Row.name, Row)
  app.component(Col.name, Col)
}

