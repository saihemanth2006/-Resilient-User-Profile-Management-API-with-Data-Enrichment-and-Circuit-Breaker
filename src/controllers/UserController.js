class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  create = async (req, res) => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json(user);
  };

  getById = async (req, res) => {
    const user = await this.userService.getUserById(req.params.id);
    res.status(200).json(user);
  };

  update = async (req, res) => {
    const user = await this.userService.updateUser(req.params.id, req.body);
    res.status(200).json(user);
  };

  remove = async (req, res) => {
    await this.userService.deleteUser(req.params.id);
    res.status(204).send();
  };

  getEnriched = async (req, res) => {
    const user = await this.userService.getEnrichedUser(req.params.id);
    res.status(200).json(user);
  };
}

module.exports = UserController;
