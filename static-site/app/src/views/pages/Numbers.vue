<script>
import { mapGetters } from 'vuex'
import axios from '../../axios'
import { handleError } from '../../handleErrors'
import NumberPurchase from '../../components/NumberPurchase';

export default {
  name: 'Numbers',
  data: () => ({
    availableNumbers: [],
    fields: ['phone_number', 'info', 'purchase'],
    showPurchaseModal: false,
    phoneNumber: '',
    selectedState: null,
    areaCode: ''
  }),
  computed: {
    ...mapGetters(['getStates']),
    states() {
      const states = [{ value: null, text: 'Select a State' }]
      for (const key in this.getStates) {
        states.push({ value: key, text: this.getStates[key] })
      }
    }
  },
  components: {
    NumberPurchase
  },
  methods: {
    async search() {
      try {
        const result = await axios.get('/numbers/search');
        const numbers = result.data

        this.availableNumbers = numbers.map(number => ({
          key: number.phoneNumber,
          phone_number: number.friendlyName,
          info: `lata: ${number.lata}, locality: ${number.locality}, region: ${number.region}, postalCode: ${number.postalCode}, isoCountry: ${number.isoCountry}, 
        capabilities: ${number.capabilities.voice ? 'voice' : ''}, ${number.capabilities.SMS ? 'SMS' : ''}, ${ number.capabilities.MMS ? 'MMS' : '' }`
        }));
      } catch (error) {
        handleError(error, this, 'danger');
      }
    },
    handlePurchase(phoneNumber) {
      this.phoneNumber  = phoneNumber;
      this.$nextTick(() => {
        this.showPurchaseModal = true;
      });
    },
    phoneNumberPurchased() {
      const numbers = this.availableNumbers;
      this.availableNumbers = numbers.filter(number => number.key !== this.phoneNumber);
      this.cancelPurchase();
    },
    cancelPurchase() {
      this.showPurchaseModal = false;
      this.$nextTick(() => {
        this.phoneNumber = ''
      });
    }
  }
}
</script>

<template>
  <b-container>
    <b-card title="Search & Purchase Phone Numbers">
      <b-form>
        <b-row>
          <b-col md="6">
            <b-form-group
              id="depts-group-1"
              description="Select a state if you prefer one"
              label="Select a state"
              label-for="depts-select"
            >
              <b-form-select
                id="depts-select"
                v-model="selectedState"
                :options="states"
              ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-input
                v-model="areaCode"
                type="text"
                placeholder="Area Code"
            ></b-form-input>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-between mb-2">
          <p>Click search button to get a list of available phone numbers</p>
          <b-button @click="search">
            <b-icon-search></b-icon-search>
          </b-button>
        </div>
        <b-table outlined hover show-empty sticky-header="600px" :fields="fields" :items="availableNumbers">
          <template #empty="scope">
            <h4>{{ scope.emptyText }}</h4>
          </template>
          <template #cell(purchase)="data">
            <b-button variant="outline-success" @click="handlePurchase(data.item.key)">purchase</b-button>
          </template>
        </b-table>
      </b-form>
    </b-card>
    <number-purchase :show="showPurchaseModal" :phoneNumber="phoneNumber" @onPurchased="phoneNumberPurchased" @onClose="cancelPurchase" />
  </b-container>
</template>