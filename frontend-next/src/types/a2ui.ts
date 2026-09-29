export interface A2UIProps {
  [key: string]: any;
}

export interface A2UIComponentSpec {
  id: string;
  component: {
    Card?: A2UIProps;
    Column?: A2UIProps;
    Row?: A2UIProps;
    Text?: A2UIProps;
    Divider?: A2UIProps;
    List?: A2UIProps;
    Image?: A2UIProps;
    Icon?: A2UIProps;
    [key: string]: any;
  };
}

export interface A2UIMessage {
  beginRendering?: {
    root?: string;
  };
  surfaceUpdate?: {
    components?: A2UIComponentSpec[];
  };
  [key: string]: any;
}
