Vue.use(VeeValidate);

var router = new VueRouter({
    mode: "history",
    routes: []
});
var app = new Vue({
  router,
  el: "#results",
  data: {
    selectedGreen: false,
    selectedAmber: false,
    selectedRed: false,
    selectedPurple: false,
    result: [],
    answers: []
  },
  filters: {},
  mounted() {
    var self = this;
    var TrainerAssessmentReportID = sessionStorage.getItem("Report");
    axios
      .get("/api/TrainerAssessmentReportResults/" + TrainerAssessmentReportID)
      .then(response => {
        this.result = response.data;
      })
      .catch(error => {
        console.log(error);
      })
      .then(function() {});

    axios
      .get("/api/TrainerAssessmentReportAnswers/" + TrainerAssessmentReportID)
      .then(response => {
        this.answers = response.data;
      })
      .catch(error => {
        console.log(error);
      })
      .then(function() {});
  },

  methods: {},
  computed: {}
});