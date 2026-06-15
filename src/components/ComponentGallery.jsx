import {
  Accordion,
  Alert,
  AlertDialog,
  AspectRatio,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  Carousel,
  Chart,
  Checkbox,
  Collapsible,
  Combobox,
  Command,
  ContextMenu,
  DataTable,
  DatePicker,
  Dialog,
  Drawer,
  DropdownMenu,
  Empty,
  Field,
  HoverCard,
  Input,
  InputGroup,
  InputOTP,
  Item,
  Kbd,
  Label,
  LogoLockup,
  LogoMark,
  Menubar,
  NavigationMenu,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  Resizable,
  ScrollArea,
  Select,
  Separator,
  Sheet,
  Sidebar,
  Skeleton,
  Slider,
  Sonner,
  Spinner,
  Switch,
  Table,
  Tabs,
  Textarea,
  Toggle,
  ToggleGroup,
  Tooltip,
  Typography,
} from "./ui/index.js";
import "./ui.css";

const tiles = [
  { name: "Accordion", element: <Accordion /> },
  { name: "Alert", element: <Alert /> },
  { name: "Alert Dialog", element: <AlertDialog /> },
  {
    name: "Aspect Ratio",
    element: (
      <AspectRatio>
        <div className="ui-aspect-demo">16:9 preview</div>
      </AspectRatio>
    ),
  },
  { name: "Avatar", element: <Avatar name="Charlotte Deane" /> },
  { name: "Badge", element: <Badge label="New" /> },
  { name: "Breadcrumb", element: <Breadcrumb /> },
  { name: "Button", element: <Button>Start assignment</Button> },
  {
    name: "Button Group",
    element: (
      <ButtonGroup>
        <Button size="sm" variant="secondary">
          Duplicate
        </Button>
        <Button size="sm">Assign</Button>
      </ButtonGroup>
    ),
  },
  { name: "Calendar", element: <Calendar /> },
  { name: "Card", element: <Card /> },
  { name: "Carousel", element: <Carousel /> },
  {
    name: "Chart",
    element: <Chart title="Class score trend" timeframe="Last 3 months" />,
  },
  { name: "Checkbox", element: <Checkbox /> },
  { name: "Collapsible", element: <Collapsible /> },
  { name: "Combobox", element: <Combobox /> },
  { name: "Command", element: <Command /> },
  { name: "Context Menu", element: <ContextMenu /> },
  { name: "Data Table", element: <DataTable /> },
  { name: "Date Picker", element: <DatePicker /> },
  { name: "Dialog", element: <Dialog /> },
  { name: "Drawer", element: <Drawer /> },
  { name: "Dropdown Menu", element: <DropdownMenu /> },
  { name: "Empty", element: <Empty /> },
  { name: "Field", element: <Field /> },
  { name: "Hover Card", element: <HoverCard /> },
  { name: "Input", element: <Input /> },
  { name: "Input Group", element: <InputGroup /> },
  { name: "Input OTP", element: <InputOTP /> },
  {
    name: "Item",
    element: (
      <Item
        title="Question bank item"
        description="Quadratics • 12 questions"
        actionLabel="Open"
      />
    ),
  },
  { name: "Kbd", element: <Kbd /> },
  { name: "Label", element: <Label>Assignment name</Label> },
  { name: "Logo Mark", element: <LogoMark /> },
  { name: "Logo Lockup", element: <LogoLockup /> },
  { name: "Menubar", element: <Menubar /> },
  { name: "Navigation Menu", element: <NavigationMenu /> },
  { name: "Pagination", element: <Pagination /> },
  { name: "Popover", element: <Popover /> },
  { name: "Progress", element: <Progress /> },
  { name: "Radio Group", element: <RadioGroup /> },
  { name: "Resizable", element: <Resizable /> },
  { name: "Scroll Area", element: <ScrollArea /> },
  { name: "Select", element: <Select /> },
  { name: "Separator", element: <Separator /> },
  { name: "Sheet", element: <Sheet /> },
  { name: "Sidebar", element: <Sidebar /> },
  { name: "Skeleton", element: <Skeleton /> },
  { name: "Slider", element: <Slider /> },
  { name: "Sonner", element: <Sonner /> },
  { name: "Spinner", element: <Spinner /> },
  { name: "Switch", element: <Switch /> },
  { name: "Table", element: <Table /> },
  { name: "Tabs", element: <Tabs /> },
  { name: "Textarea", element: <Textarea /> },
  { name: "Toggle", element: <Toggle /> },
  { name: "Toggle Group", element: <ToggleGroup /> },
  { name: "Tooltip", element: <Tooltip /> },
  { name: "Typography", element: <Typography /> },
];

function Tile({ name, children, index }) {
  return (
    <article className="ui-tile" style={{ "--i": index }}>
      <div className="ui-tile-header">
        <span>{name}</span>
      </div>
      <div className="ui-tile-body">{children}</div>
    </article>
  );
}

export default function ComponentGallery() {
  return (
    <section className="ui-gallery">
      <div className="ui-grid">
        {tiles.map((tile, index) => (
          <Tile key={tile.name} name={tile.name} index={index}>
            {tile.element}
          </Tile>
        ))}
      </div>
    </section>
  );
}
