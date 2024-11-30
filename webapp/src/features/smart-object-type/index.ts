import { ObjectTypeRegistryInstance } from './utils/registry';
import { NumberObjectType } from './types/number';
import { SmartObjectFormField } from './components/SmartObjectFormField';
import { SmartObjectForm } from './components/SmartObjectForm';
import { PercentageObjectType } from './types/percentage';
import { DateTimeObjectType } from './types/datetime';
import { ObjectObjectType } from './types/object';
import { ImageObjectType } from './types/image';
import { SmartObjectTypeValue } from './components/SmartObjectTypeValue';
import { YesNoObjectType } from './types/yesno';

ObjectTypeRegistryInstance.register(NumberObjectType);
ObjectTypeRegistryInstance.register(PercentageObjectType);
ObjectTypeRegistryInstance.register(DateTimeObjectType);
ObjectTypeRegistryInstance.register(ObjectObjectType);
ObjectTypeRegistryInstance.register(ImageObjectType);
ObjectTypeRegistryInstance.register(YesNoObjectType);

export { SmartObjectFormField, SmartObjectForm, SmartObjectTypeValue };
