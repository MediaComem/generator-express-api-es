import Generator from "yeoman-generator";
import { globSync } from "glob";
import path from "path";
import chalk from "chalk";

import { exec } from "child_process";
import { kebabCase } from "lodash-es";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class extends Generator {
  constructor(args, opts) {
    super(args, opts, { customInstallTask: true });
    this.options = opts;
    this.slugify = kebabCase;
    this.env.options.nodePackageManager = "npm";
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter your project's name",
        default: "express-api"
      },
      {
        type: "confirm",
        name: "createDirectory",
        message: "Would you like to create a new directory for your project?"
      }
    ]).then((answers) => {
      this.options.dirname = this.slugify(answers.name);
      this.options.createDirectory = answers.createDirectory;
    });
  }

  writing() {
    if (this.options.createDirectory) {
      this.destinationRoot(this.options.dirname);
      this.appname = this.options.dirname;
    }

    this.sourceRoot(path.join(__dirname, "templates", "common"));
    globSync("**", {
      cwd: this.sourceRoot(),
      dot: true
    }).map((file) =>
      this.fs.copyTpl(this.templatePath(file), this.destinationPath(file), this)
    );

    // routes
    this.sourceRoot(path.join(__dirname, "templates", "routes"));
    globSync("**", {
      cwd: this.sourceRoot()
    }).map((file) =>
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(path.join("routes", file)),
        this
      )
    );
  }
  async install() {
    this.log.info("Installing npm packages");
    await exec(`cd ${this.destinationPath()} && npm install`);
  }

  end() {
    this.log(
      chalk.bold.green(`Your express app has been generated. 
You can start it by entering the following commands:`)
    );
    this.log(
      chalk.bold.white(`cd ${this.options.dirname}
DEBUG=${this.options.dirname}:* npm start `)
    );
  }
}
