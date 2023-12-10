export const addDecimal = (value) => {
    if (typeof value !== 'number') {
      return "Please provide a valid number";
    }

    // Add decimal point and divide by 100
    return (value / 100).toFixed(2);
  }

  export const formatDate = (dateString) => {
    const removeTimestamp = (dateString) => {
      return dateString?.split('T')[0];
    };
    if (!dateString) {
      return null;
    }
    if (dateString.includes('T')) {
      return removeTimestamp(dateString)?.split('-').join('-');
    }
  };
  
  