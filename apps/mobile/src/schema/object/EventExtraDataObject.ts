export default interface EventExtraDataObject {
  id: string
  name: string
  description: string
  valueType: 'string' | 'number' | 'stringArray'
  stringValue: string
  numberValue: number
  stringArrayValue: string[]
}

export function eventExtraDataObject_default(): EventExtraDataObject {
  return {
    id: '',
    name: '',
    description: '',
    valueType: 'string',
    stringValue: '',
    numberValue: 0,
    stringArrayValue: [],
  }
}
