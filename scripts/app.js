var app = angular.module('tictac', ['ng']);

var game_start_url='http://interview.314.tt/api/game';
var game_send_data_url='http://interview.314.tt/api/game';
var game_status_url='http://interview.314.tt/api/game';

app.controller('TicTacController', function($scope,$rootScope,$http,$timeout){
  
  $scope.resetGameSettings = function(){
	 $scope.myboard = [];
     $scope.matchArray = [];
     $scope.winnerSymbol = "";
	 $scope.botSymbol = "";
	 $scope.currentGameToken = "";
	 $scope.player = {};
	 $scope.gameInProgress = false;
	 $scope.gameLoading = false;
	 $scope.botThinking = false;
  }
  
  $scope.startGame = function(){	
      console.log("User selected "+$scope.player.symbol);
      console.log("User selected start "+$scope.player.start);
	  if(!$scope.player.symbol || $scope.player.symbol==''){
		  alert("Please select your symbol");
		  return;
	  }
	  $scope.gameDrawn = false;
	  $scope.gameLoading = true;
	  console.log(" $scope.gameLoading "+$scope.gameLoading);
	  if($scope.player.symbol=='o'){
		$scope.botSymbol = 'x';
	  } else{
		$scope.botSymbol = 'o';
	  }
	  
	  var postData = {};
	  postData.player = $scope.player.symbol;
	  
	  if($scope.player.start){
		  postData.playerStarts = $scope.player.start;
	  }
	  
	  
	  //send to server
	  $http({
		method: 'POST',
		url: game_start_url,
		data: postData,
		headers: {
			'Content-Type': 'application/json'
		}}).then(function(result) {
			   console.log(JSON.stringify(result));
			   result = result.data || result;
			   if(result.token){//proceed only if we received game token
				  console.log("Received token "+result.token);
				  $scope.currentGameToken = result.token;//save current game token 
				  $scope.myboard = result.game.board;//initialize our board array with server's array (angular will plot automatically, refer ui.html)
				  $scope.gameInProgress = true;//this flag shows game board and hides settings
				  $scope.gameLoading = false;//this hides the loading bar in blue
			   } else{//if no game token received, show alert message
				  alert("Failed to receive game token. Please check server api");
				  $scope.gameLoading = false;
			   }
		   }, function(error) {
			   alert("Failed to receive game token. "+error);
			   $scope.gameLoading = false;
		   });
  }
  

	$scope.onUserClick = function(rowindex,columnindex){
		console.log("User clicked on "+columnindex+"  column in "+rowindex +"  row");
		
		//verify where he clicked -
		var clickedCell = $scope.myboard[rowindex][columnindex];
		if(clickedCell!=null){//if clicked on non empty cell, then return
			return;
		} 
		
		$scope.myboard[rowindex][columnindex] = $scope.player.symbol;
		
		console.log("updated json is "+JSON.stringify($scope.myboard));
		
		$scope.botThinking = true;//flag to show bot thinking message
		
		$http({
		method: 'PUT',
		url: game_send_data_url,
		data: {x:rowindex,y:columnindex},
		headers: {
			'Content-Type': 'application/json',
			'token':$scope.currentGameToken
		}}).then(function(result) {
			   console.log(" BOT MADE A MOVE "+JSON.stringify(result));
			   result = result.data || result;
			   if(result.game.board){
				  $scope.botThinking = false;
				  $scope.myboard = result.game.board;
				  if(result.game.winner==null && $scope.isGameDrawn()){//check if game is drawn
					 console.log("Game drawn ");
					 $scope.gameDrawn = true;
				  }
				  if(result.game.winner!=null){//check if winner is found
					 console.log("Winner is found.");
					 $scope.showWinner(result.game.winner);
				  }
			   } else{
				  alert("Failed to receive game data. Please check server api");
				  $scope.botThinking = false;
			   }
		   }, function(error) {
			   alert("Failed to receive game data. "+error);
			   $scope.botThinking = false;
		   });
	}
	
	$scope.showWinner = function(winnerObj){//if winner is found, show message and highlight matching row/column in green
		console.log("Winner object is "+JSON.stringify(winnerObj));
		$scope.matchArray = [["","",""],["","",""],["","",""]];
		
		angular.forEach(winnerObj.match,function(value,key){//winnerObj.match has the x,y coordinates of winning pattern
			$scope.matchArray[value[0]][value[1]]="match-color";//match-color is the css class for making box green - refer ui.html
		});
		
		$scope.winnerSymbol = winnerObj.figure;
		console.log("Winner symbol is "+$scope.winnerSymbol);
		console.log("Player symbol is "+$scope.player.symbol);
	}
	
	$scope.onSelectSymbol = function(symbol){
		$scope.player.symbol = symbol;
	}
	
	$scope.onSelectStart = function(isPlayerStarts){
		$scope.player.start = isPlayerStarts;
	}
	
	$scope.isGameDrawn = function(){
		var hasEmptyBox = false;
		angular.forEach($scope.myboard,function(value,key){
			angular.forEach(value,function(value1,key1){
				if(!value1 || value1.length==0){
					hasEmptyBox = true;
				}
			});
		});
		return !hasEmptyBox;
	}
	
	$scope.resetGameSettings();//on load , reset game
});


