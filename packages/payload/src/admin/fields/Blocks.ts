import type { BlockField } from '../../fields/config/types.js'
import type { BlockFieldValidation } from '../../fields/validations.js'
import type { ErrorComponent } from '../forms/Error.js'
import type { FieldMap } from '../forms/FieldMap.js'
import type {
  DescriptionComponent,
  FormFieldBase,
  LabelComponent,
  MappedComponent,
} from '../types.js'

export type BlocksFieldProps = {
  blocks?: ReducedBlock[]
  forceRender?: boolean
  isSortable?: boolean
  labels?: BlockField['labels']
  maxRows?: number
  minRows?: number
  name?: string
  slug?: string
  validate?: BlockFieldValidation
  width?: string
} & FormFieldBase

export type ReducedBlock = {
  LabelComponent: MappedComponent
  custom?: Record<any, string>
  fieldMap: FieldMap
  imageAltText?: string
  imageURL?: string
  labels: BlockField['labels']
  slug: string
}

export type BlocksFieldLabelComponent = LabelComponent<'blocks'>

export type BlocksFieldDescriptionComponent = DescriptionComponent<'blocks'>

export type BlocksFieldErrorComponent = ErrorComponent<'blocks'>
