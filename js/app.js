//Create the angular app
angular.module('firstApp', [])
// Add our controller
.controller('mainController', function()	{
	// Bind this controller to a variable instead of the keyword 'this' in case of Javascript callbacks that use the keyword 'this'
	var vm = this;
	// Define variables and objects on this
	// This makes them available for our view

	// Maybe a single variable
	vm.message = 'Hooray! Our app is working!';

	// Or an array of objects
	vm.computers = [{name: 'Tecno', color: 'White', levels: 'Chinco'}, {name: 'Samsung', color: 'Gold', levels: 'Oga'}, {name: 'Iphone', color: 'Black', levels: 'I-diot'}];

	// information that comes from our form
	vm.computerData = {};
	
	vm.addComputer = function() {
	// add a computer to the list
	
	vm.computers.push({
		name: vm.computerData.name,
		color: vm.computerData.color,
		levels: vm.computerData.levels
	});
	
	// after our computer has been added, clear the form
	vm.computerData = {};
	};
});