var app = angular.module('angular-poll', [
	'firebase',
	'ui.router',
	'ngSanitize'
]);

app.config(['$stateProvider', '$urlRouterProvider', Config]);

function Config($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: "templates/home.html",
			controller: "HomeCtrl"
		})
		.state('voting', {
			url: '/poll/:pollid',
			templateUrl: "templates/voting.html",
			controller: "VotingCtrl"
		})
		.state('results', {
			url: '/poll/:pollid/results',
			templateUrl: "templates/results.html",
			controller: "ResultsCtrl"
		})
	;
	
	$urlRouterProvider.otherwise("/");
}

app.controller('AppCtrl', ['$scope', AppCtrl]);

function AppCtrl($scope){
	$scope.AppTitle = "民意调查";
}

app.controller('HomeCtrl', ['$scope', '$state', 'Poll', HomeCtrl]);

function HomeCtrl($scope, $state, Poll){
	// 一项新的民意调查，基本明确初始化的形式
	function InitNewPoll(){
		$scope.Poll = {
			Question: "",
			Answers: [{},{},{},{}]		// 创建4个空白选项

		};
	}
	
	// 在列表中添加一个可用的答案
	$scope.AddAnswer = function(){
		$scope.Poll.Answers.push({});
	};
	
	//清除输入框
	$scope.ClearAnswer = function(Answer) {
		delete Answer.label;
	};
	
	// 提交投票发然后发送用户投票区投票
	$scope.CreatePoll = function(){
		Poll.create($scope.Poll).then(function(ref){
			var PollID = ref.key();
			$state.go('voting', {"pollid": PollID});
		});
		// 开始一项新的民意调查
		InitNewPoll();
	};
	
	//从列表中删除可用的答案
	$scope.RemoveAnswer = function(key){
		if ($scope.Poll.Answers.length > 2) {
			$scope.Poll.Answers.splice(key,1);
		} else {
			alert('至少有2个答案是必要的一个调查.');
		}
	};
	
	InitNewPoll();
}

app.controller('VotingCtrl', ['$location','$scope', '$state', '$stateParams', 'Poll', VotingCtrl]);

function VotingCtrl($location, $scope, $state, $stateParams, Poll){
	//从火力点得到投票
	$scope.Poll = Poll.get($stateParams.pollid);
	
	$scope.MyVote = {};
	
	// 提供网址分享
	$scope.PollUrl = $location.absUrl();
	$scope.codeUrl = "abs" +"PollUrl"
		var.codeUrl =""+PollUrl+();
	// 提交投票
	$scope.Vote = function(){
		var Answer = $scope.MyVote.Answer;
		// 增加值/投票给用户投票
		if (Answer.value) {
			Answer.value++;
		} else {
			Answer.value = 1;
		}
		//同步变化，那么这个火力点投票结果页面过渡
		$scope.Poll.$save().then(function(ref){
			var PollID = ref.key();
			$state.go('results', {"pollid": PollID});
		});
	};
}

app.controller('ResultsCtrl', ['$location', '$scope', '$stateParams', 'Poll', ResultsCtrl]);

function ResultsCtrl($location, $scope, $stateParams, Poll){
	//从火力点得到投票
	$scope.Poll = Poll.get($stateParams.pollid);
	
	// 提供网址分享

	$scope.PollUrl = $location.absUrl();
	
	ChartColours = [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'AquaMarine',
		'Azure',
		'Beige',
		'Bisque',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkSlateBlue',
		'DeepPink',
		'Gold',
		'LightSalmon',
		'LightSkyBlue',
		'Tomato',
		'YellowGreen'
	];
	
	//从DOM把帆布
	var canvas = document.getElementById("ResultsChart").getContext("2d");
	//使画布一炸圈饼图

	var ResultsChart = new Chart(canvas);
	
	// 计算使用百分比的投票数

	function CalcVotes(){
		$scope.TotalVotes = 0;
		angular.forEach($scope.Poll.Answers, function(data){
			$scope.TotalVotes += data.value || 0;
		});
	}
	
	//格式化并呈现图表数据
	function RenderChart(){
		var PickedColours = [];
		angular.forEach($scope.Poll.Answers, function(data){
			// 给每个答案加上一个随机的颜色
			var RandVal = Math.floor((Math.random()) * (ChartColours.length - 1));
			var colour = ChartColours[RandVal];
			if (PickedColours.length > 0) {
				for (var i = 0; i < PickedColours.length; i++) {
					// 看看这个颜色了已经
					if (colour === PickedColours[i]) {
						//颜色已经被选中，所以得到一个新的
						RandVal = Math.floor((Math.random()) * (ChartColours.length - 1));
						colour = ChartColours[RandVal];
						//重置计数器
						i = 0;
					} 
				}
			}
			// 设置颜色
			data.color = colour;
			//把这个颜色加在颜色上，这样就不用再使用了
			PickedColours.push(colour);
			
			// 设置值为0，如果没有可用！价值=破chartjs

			if (!data.value) {
				data.value = 0;
			}
		})
		// 使画布一炸圈饼图
		ResultsChart = ResultsChart.Doughnut($scope.Poll.Answers);
		CalcVotes();
	}
	
	// 更新图表值和票数

	function UpdateChart(){
		if (ResultsChart.update) {
			// 更新图表段
			angular.forEach(ResultsChart.segments, function(segment, i){
				ResultsChart.segments[i].value = $scope.Poll.Answers[i].value || 0;
			});
			// The /重画海图更新
			ResultsChart.update();
		}
		CalcVotes();
	}
	
	//
	$scope.Poll.$loaded().then(function(){
		RenderChart();
	});
	
	// 渲染图一次民调数据已加载的火力点
	$scope.Poll.$watch(function(){
		UpdateChart();
	});
	
}

app.service('Poll', ['$firebaseArray', '$firebaseObject', Poll]);

function Poll($firebaseArray, $firebaseObject){
	var ref = new Firebase('https://glowing-inferno-7011.firebaseio.com/toupiao/');
	var Polls = $firebaseArray(ref);
	
	return {
		"Polls": Polls,
		"create": function(PollData) {
			return this.Polls.$add(PollData);
		},
		"get": function(PollID) {
			return $firebaseObject(ref.child(PollID));
		}
	}
}