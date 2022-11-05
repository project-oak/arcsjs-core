({

update({operator, operand1, operand2}) {
  switch (operator) {
    case 'add': 
    case 'plus': 
      return {result: String(operand1 + operand2)};
    case 'subtract':
    case 'minus':
      return {result: String(operand1 - operand2)};
    case 'multiply':
    case 'times':
      return {result: String(operand1 * operand2)};
    case 'divide':
      return {result: String(operand1 / operand2)};
    // TODO(mariakleiner): to be continued.
  }
}

});
