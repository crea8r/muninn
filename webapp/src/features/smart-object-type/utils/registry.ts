// src/features/smart-object-type/utils/registry.ts

import { ObjectTypeImplementation, ObjectTypeRegistry } from '../type';
import { StringObjectType } from '../types/string';

class ObjectTypeRegistryImpl implements ObjectTypeRegistry {
  private types: Map<string, ObjectTypeImplementation>;

  constructor() {
    this.types = new Map();

    // Register default string type
    this.register(StringObjectType);
  }

  register(implementation: ObjectTypeImplementation): void {
    if (this.types.has(implementation.type)) {
      console.warn(`Object type ${implementation.type} is being overwritten`);
    }
    this.types.set(implementation.type, implementation);
  }

  get(type: string): ObjectTypeImplementation | undefined {
    const implementation = this.types.get(type);
    if (!implementation) {
      console.warn(
        `Object type ${type} not found, falling back to string type`
      );
      return this.types.get('string');
    }
    return implementation;
  }

  getAll(): Map<string, ObjectTypeImplementation> {
    return new Map(this.types);
  }
}

// Export singleton instance
export const ObjectTypeRegistryInstance = new ObjectTypeRegistryImpl();
