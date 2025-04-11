window._flutter = {
  loader: {
    loadEntrypoint: function(options) {
      return Promise.resolve({
        initializeEngine: function() {
          return Promise.resolve({
            runApp: function() {
              return Promise.resolve();
            }
          });
        }
      });
    }
  }
}; 