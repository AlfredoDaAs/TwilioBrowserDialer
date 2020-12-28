<script>
import firebase from "firebase/app";
import { mapGetters } from "vuex";
import { handleMessage } from '../handleErrors'

export default {
  name: "TransferOption",
  data: () => ({
    selectedDept: null,
    selectedAgent: null,
    transferUsers: [{ value: null, text: "Transfer To Agent" }]
  }),
  props: {
    show: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getDepartments"]),
    departments() {
      return [{ value: null, text: "Transfer to Department" }].concat(
        this.getDepartments.map((dep) => ({
          value: dep.name.trim(),
          text: dep.name,
        }))
      );
    },
  },
  methods: {
    listenUsers() {
      firebase
        .database()
        .ref("users")
        .on("value", (items) => {
          items.forEach((item) => {
            const key = item.key;
            const data = item.val();
            if (key !== this.getUserId && data.status === "online") {
              this.transferUsers.push({
                value: key,
                text: data.name,
              });
            }
          });
        });
    },
    handleOk(e) {
      e.preventDefault();
      this.makeTransfer();
    },
    makeTransfer() {
      if (this.selectedDept === null && this.selectedAgent === null) {
        handleMessage('Please select a Department or an Agent', this, 'danger');
        return;
      }

      this.$emit('onTransfer', {
        department: this.selectedDept,
        agentId: this.selectedAgent
      })
    },
    onChange(visible) {
      if (!visible) {
        this.close();
      }
    },
    close(e) {
      if (e) {
        e.preventDefault();
      }

      this.$emit("onClose");
    },
    onDeptsChange(val) {
      if(val) {
        this.selectedAgent = null;
      }
    },
    onAgentChange(val) {
      if(val) {
        this.selectedDept = null;
      }
    }
  },
  created() {
    this.listenUsers();
  }
};
</script>

<template>
  <b-modal
    title="Transfer Call"
    :visible="show"
    ok-title="Submit"
    ok-variant="outline-primary"
    @ok="handleOk"
    cancel-variant="outline-secondary"
    @cancel="close"
    @change="onChange"
  >
    <div id="transfer-depts" class="d-flex">
      <b-form-group
        id="depts-group-2"
        description="select all departments you want for this User"
        label="Select Departments"
        label-for="depts-select"
      >
        <b-form-select
          id="depts-select-2"
          v-model="selectedDept"
          :options="departments"
          @change="onDeptsChange"
        ></b-form-select>
      </b-form-group>
    </div>
    <hr />
    <div id="transfer-agent" class="d-flex">
      <b-form-select
        style="width: 360px"
        v-model="selectedAgent"
        :options="transferUsers"
        @change="onAgentChange"
      ></b-form-select>
    </div>
  </b-modal>
</template>