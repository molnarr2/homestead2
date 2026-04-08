export default interface AddressObject {
  name: string
  street1: string
  street2: string
  city: string
  state: string
  postal_code: string
  country: string
}

export function addressObject_default(): AddressObject {
  return {
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  }
}
