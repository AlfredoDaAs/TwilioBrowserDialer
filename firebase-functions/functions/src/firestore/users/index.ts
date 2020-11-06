import AbstractCollection from '../../firebase/AbstractCollection'
// import { throwUntrustedClientError } from '../../common/FriendlyError'

const collectionName = 'users'

class Collection extends AbstractCollection {
    public defaultValues: any = {
        name: null,
        email: null,
        phoneNumber: '',
        isAdmin: false,
        metadata: null
    }
}

export default new Collection(collectionName)