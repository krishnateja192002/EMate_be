exports.getTextUsers = async (req, res) => {
  try {
    const examples = await exampleService.getExamples();
    res.json(examples);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.startChat = async (req, res) => {
  try {
    const { name } = req.body;
    const newExample = await exampleService.createExample(name);
    res.json(newExample);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};