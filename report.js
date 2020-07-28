Vue.use(VeeValidate);

var router = new VueRouter({
  mode: "history",
  routes: []
});
var app = new Vue({
  router,
  el: "#results",
  data: {
    questionOrder: 1,
    questionCount: 0,
    score: 0,
    lessonScore: 0,
    riskScore: 0,
    teachingScore: 0,
    questionsComplete: false,
    showNote: false,
    trafficLight: '',

    form: {
      currentSession: '',
      nextSession: '',
      reason: '',
      message: false
    },
    report: [],
    reportSubmit: []
  },
  mounted() {
    var order = this.questionOrder;
    var self = this;

    //get the questions based on the order

    //count total number of questions
    axios
      .get("/api/NumberOfTrainerAssessmentReportQuestions/")
      .then(response => {
        this.questionCount = response.data;
      }),
      axios
        .get("/api/TrainerAssessmentReport/" + order)
        .then(response => {
          this.report = response.data;
        })
        .catch(error => {
          console.log(error);
        })
        .then(function () {
          console.log("keep going!");
        }),
        
      this.submitPlaceholderAssessment();
        
  },

  methods: {
    submitGreen: function() {
      this.questionOrder++;
      var order = this.questionOrder;
      this.score = this.score + 3;
      this.trafficLight = 1;
      var questionType = this.report.trainerAssessmentReportAreaID;
      var addToScore = 3;
      this.form.reason = '';


      //calculate scores for specific areas
      this.calcScoreArea(addToScore, questionType);

      //next question or finished
      this.isFinished(order);

    },
    submitAmber: function() {
      this.score = this.score + 2;
      this.questionOrder++;
      var order = this.questionOrder;
      this.trafficLight = 2;
      var questionType = this.report.trainerAssessmentReportAreaID;
      var addToScore = 2;

      //calculate scores for specific areas
      this.calcScoreArea(addToScore, questionType);

      //show reason screen
      this.showReason(addToScore, questionType);

    },
    submitRed: function() {
      this.score = this.score + 1;
      this.questionOrder++;
      var order = this.questionOrder;
      this.trafficLight = 3;
      var questionType = this.report.trainerAssessmentReportAreaID;
      var addToScore = 1;

      //calculate scores for specific areas
      this.calcScoreArea(addToScore, questionType);

      //show reason screen
      this.showReason(addToScore, questionType);

    },
    submitPurple: function() {
      this.questionOrder++;
      var order = this.questionOrder;
      this.trafficLight = 4;
      var questionType = this.report.trainerAssessmentReportAreaID;
      var addToScore = 0;

      //calculate scores for specific areas
      this.calcScoreArea(addToScore, questionType);

      //show reason screen
      this.showReason(addToScore, questionType);

    },
    getQuestion: function(order) {
      axios
        .get("/api/TrainerAssessmentReport/" + order)
        .then(response => {
          this.report = response.data;
        })
        .catch(error => {
          console.log(error);
        })
        .then(function() {
          
        });
    },
    calcScoreArea: function(addToScore, questionType) {
      if (questionType === 1) {
        this.lessonScore = this.lessonScore + addToScore;
      }
      else if (questionType === 2) {
        this.riskScore = this.riskScore + addToScore;
      }
      else if (questionType === 3) {
        this.teachingScore = this.teachingScore + addToScore;
      }
    },

    isFinished: function (order) {
      // get next question
 
      if (order <= this.questionCount) {
        
       
        this.postAnswer();
       

        this.getQuestion(order);
      }

      // finished create the report
      else {
        this.postAnswer();
        this.questionsComplete = true;
      }
    },

    showReason: function () {
      
      this.form.reason = '';
      this.showNote = true;
    },

    addReason: function () {
      var order = this.questionOrder;

 
      this.showNote = false;
      this.isFinished(order);
    },

    submitAssessment: function () {

      if (this.form.nextSession == "") {
      
        this.form.message = true;

      }


      else {


        this.$validator.validateAll();

        //if passes validation
        if (!this.errors.any()) {

      
          var self = this;
          var assignedId = this.$route.query.id;
          sessionStorage.setItem("Report", this.reportSubmit.trainerAssessmentReportID);

          //at the end of assessment update it 
          axios
            .put("/api/UpdateTrainingReport/", {
              workshopAssignedId: assignedId,
              //DateOfSession: this.form.currentSession,
              DateOfNextSession: this.form.nextSession,
              LessonScore: this.lessonScore,
              RiskScore: this.riskScore,
              TeachingScore: this.teachingScore,
              score: this.score,
              Submit: true,
              TrainerAssessmentReportId: this.reportSubmit.trainerAssessmentReportID

            })
            .then(function (response) {
              this.window.location.href = 'ReportComplete';
              console.log('redirect me');
            
            })
            .catch(function (error) { });
  
        
        }

        else {
          console.log('failed validation');
        }
        
      }
    },

    postAnswer: function () {
      //post answer to database 
      var self = this;
 
 
      axios
        .post("/api/SubmitTrainingReportAnswer/", {
          TrafficLightId: this.trafficLight,
          TrainerAssessmentReportId: this.reportSubmit.trainerAssessmentReportID,
          Reason: this.form.reason,
          WorkshopAssignedId: this.reportSubmit.workshopAssignedId,
          TrainerAssessmentReportQuestionId: this.report.trainerAssessmentReportQuestionId


        })
        .then(function (response) {

        })
        .catch(function (error) { });
      
      
      
      
    },


    submitPlaceholderAssessment: function () {
      var self = this;
      var assignedId = this.$route.query.id;

    
      axios
        .post("/api/SubmitTrainerReport/", {
          workshopAssignedId: assignedId,
          LessonScore: 0,
          RiskScore: 0,
          TeachingScore: 0,
          score: 0,
          Submit: false

        })
        .then(function (response) {
          console.log(response);
          
          self.reportSubmit = response.data; 

    
      
        })
        .catch(function (error) { });
    }

  },

  computed: {
    formValidated() {
      return (
        Object.keys(this.fields).some(key => this.fields[key].validated) &&
        Object.keys(this.fields).some(key => this.fields[key].valid)
      );
    }
  }
});
