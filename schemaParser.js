const fs = require('fs');
const path =  require('path');

class SchemaParser {
  constructor(filePath) {
    const absoluteFilePath = path.join(__dirname, filePath);
    this.fileContent = fs.readFileSync(absoluteFilePath).toString('utf8');
  }

  translate() {
    this.schemaParser();
  }

  schemaParser() {
    const rawSchema = this.fileContent;
    const schema = this.filterSchema(rawSchema);
    let primaryKey;
    const entries = schema.split('\n').filter(entry => {
      if(entry.includes('PRIMARY KEY')) primaryKey = this.getPrimaryKey(entry);
      return !entry.includes('KEY');
    });
  
    const tableName = entries[0].substring(14, entries[0].length - 3);
    const len = entries.length;
    
    // Remove First and Last lines
    entries.splice(0, 1);
    entries.splice(len - 2, 1);
  
    const formattedEntries = this.parseEntries(entries);
    const fileContent = this.buildSequelizeSchema(primaryKey, tableName, formattedEntries);
    const { fileName } = this.camelCase(tableName);
    const filePath = __dirname + '/models/' + fileName + '.js';
    console.log(filePath);
    fs.appendFile(fileName+'.js', fileContent, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }

  filterSchema(schemaFile) {
    const filteredSchema = schemaFile
      .split('\n').filter(line => {
        return (
             !line.startsWith('--') 
          && !line.startsWith('/*') 
          && !line.startsWith('DROP TABLE')
          && line !== ''
        );
      })
      .join('\n');
    return filteredSchema;
  }

  getPrimaryKey(entry) {
    const temp = entry.split('PRIMARY KEY ')[1];
    let end;
    if(temp.endsWith(',')) {
      end = 3;
    } else {
      end = 2;
    }
    const key = temp.slice(2, temp.length - end);
    return key;
  }

  parseEntries(entries) {
    const parseEntry = (entry) => {
      let allowNull = -1;
      let defaultValue = -1;
      let autoIncrement = -1;
      let primaryKey = -1;
      if (entry.includes('NOT NULL')) {
        allowNull = false;
      }
      if (entry.includes('DEFAULT')) {
        const defaultArr = entry.split(' ');
        const defaultIndex = defaultArr.indexOf('DEFAULT');
        let defaultValueTemp = defaultArr[defaultIndex + 1];
        if(defaultValueTemp.endsWith(',')) {
          defaultValue = defaultValueTemp.slice(0, defaultValueTemp.length - 1);
        }
      }
      if (entry.includes('AUTO_INCREMENT')) {
        autoIncrement = true;
      }
      const lexicons = entry.split(' ').filter(lex => lex !== '');
      const key = lexicons[0].split('`').join('');
      const type = lexicons[1];
      return {
        key,
        type,
        allowNull,
        defaultValue,
        autoIncrement
      }
    }
    const parsedEntries = [];
  
    entries.forEach(entry => {
      parsedEntries.push(parseEntry(entry));
    })
  
    return parsedEntries;
  }

  buildSequelizeSchema (primaryKey, tableName, formattedEntries) {
    const { modelName} = this.camelCase(tableName);
    formattedEntries.map(entry => {
      const { dataType, values } = this.formatType(entry.type);
      entry.type = dataType;
      if(values) entry.values = values;
      if(entry.key === primaryKey) entry.primaryKey = true;
    });
  
    let fileContent = 
    `const Sequelize = require('sequelize');
  const sequelize = require('./db');
  const ${modelName} = sequelize.define(${tableName}, {`;
  
    formattedEntries.forEach(entry => {
    
      let entryString = `
    ${entry.key}: {
      type: ${entry.type},`;
  
      if(entry.allowNull !== -1) {
        entryString += `
      allowNull: ${entry.allowNull},`
      }
      if(entry.autoIncrement !== -1) {
        entryString += `
      autoIncrement: ${entry.autoIncrement},`
      }
      if(entry.defaultValue !== -1) {
        entryString += `
      defaultValue: ${entry.defaultValue},`
      }
      if(entry.values) {
        entryString += `
      values: ${entry.values},`
      }
      if(entry.primaryKey) {
        entryString += `
      primaryKey: true,`
      }
      
      entryString += `
    },`;
  
      fileContent += entryString;
    });
  
    fileContent += `
  });
  module.exports = ${modelName};`;
  
    return fileContent;
  }

  camelCase(tableName) {
    let modelName = tableName
      .split('_').map(name => name.charAt(0).toUpperCase() + name.slice(1))
      .join('');
    let fileName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    return { modelName, fileName };
  }

  formatType(type) {
    let dataType = type.toString();
    let values;
    if(dataType.startsWith('int')) {
      dataType = dataType.replace('int', 'Sequelize.INTEGER');
    }
    if(dataType.startsWith('tinyint')) {
      dataType = dataType.replace('tinyint', 'Sequelize.TINYINT');
    }
    if(dataType.startsWith('tinyint')) {
      dataType = dataType.replace('tinyint', 'Sequelize.TINYINT');
    }
    if(dataType.startsWith('varchar')) {
      dataType = dataType.replace('varchar', 'Sequelize.STRING');
    }
    if(dataType.startsWith('text')) {
      dataType = dataType.replace('text,', 'Sequelize.TEXT');
    }
    if(dataType.startsWith('datetime')) {
      dataType = dataType.replace('datetime', 'Sequelize.TIME');
    }
    if(dataType.startsWith('decimal')) {
      dataType = dataType.replace('decimal', 'Sequelize.DECIMAL');
    }
    if(dataType.startsWith('enum')) {
      values = '[' + dataType.substring(5, dataType.length - 1) + ']';
      dataType = 'Sequelize.ENUM';
    }
    return { dataType, values };
  }
}

module.exports = SchemaParser;
