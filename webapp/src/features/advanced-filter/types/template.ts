import { FilterConfig } from 'src/types/FilterConfig';
import { ViewConfigBase } from './view-config';
export interface ActionConfig {
  tagIds?: string[];
  funnelId?: string;
}

export interface Template {
  id?: string;
  name?: string;
  description?: string;
  config: {
    version: string;
    filter?: Partial<FilterConfig>;
    view?: Partial<ViewConfigBase>;
  };
}

export interface TemplateAction {
  id?: string;
  name?: string;
  description?: string;
  config: {
    version: string;
    filter?: Partial<FilterConfig>;
  };
  action: ActionConfig;
}
