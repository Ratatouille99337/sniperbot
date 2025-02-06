const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const uniqueEvents = (data) => {
    const uniqueData = Array.from(
      data.reduce((map, obj) => {
        const key = obj.block.blockNumber;
        if (!map.has(key)) {
          map.set(key, obj); // Add the object if the blockNumber is not already in the map
        }
        return map;
      }, new Map()).values()
    );
    return uniqueData
}

module.exports = {
    delay,
    uniqueEvents,
}