const { message, getRawLogs } = require('./shared');

module.exports.fromGraph = async (graph, eventName) => {
  const out = await Promise.all(
    graph.nodes().map(async (label, events) => {
      if (!events.includes(eventName)) return [];

      const contract = graph.node(label).contract;
      const events = await fromContract(contract, eventName).catch(console.log);
      message(events.length, eventName, label);

      return events;
    })
  );

  return [].concat.apply([], out);
};

// ------------------------------------------------------------

fromContract = async (contract, eventName) => {
  const raw = await getRawLogs(contract, {}, eventName);

  return raw.map(log => {
    const out = {
      type: eventName,
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      src: log.address
    };

    if (eventName === 'LogSetAuthority') {
      out.dst = log.returnValues.authority;
    }

    if (eventName === 'LogSetOwner') {
      out.dst = log.returnValues.owner;
    }

    return out;
  });
};

// ------------------------------------------------------------
