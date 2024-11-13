import { GeneratedCode } from "@/types/json-to-dart";

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toSnakeCase = (str: string): string => {
  return str
    // Handle special case where a capital letter is followed by another capital letter
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    // Handle normal case where a capital letter is in the middle of the word
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
};

export const collectGeneratedCodes = (
  jsonData: any,
  className: string
): GeneratedCode[] => {
  const codes: GeneratedCode[] = [];
  const processedClasses = new Set<string>();

  // First add the root class with isRoot flag 
  codes.push({
    name: className,
    fileName: toSnakeCase(className),
    entityCode: generateEntityClass(jsonData, className, true),
    modelCode: generateModelClass(jsonData, className, true)
  });

  // Collect nested objects
  const collectNestedObjects = (obj: any) => {
    for (const [key, value] of Object.entries(obj)) {
      if (!value || typeof value !== 'object') continue;

      if (Array.isArray(value)) {
        const firstItem = value[0];
        if (firstItem && typeof firstItem === 'object') {
          const itemName = capitalizeFirst(key.replace(/s$/, ''));
          if (!processedClasses.has(itemName)) {
            processedClasses.add(itemName);
            codes.push({
              name: itemName,
              fileName: toSnakeCase(itemName),
              entityCode: generateEntityClass(firstItem, itemName, false),
              modelCode: generateModelClass(firstItem, itemName, false)
            });
            collectNestedObjects(firstItem);
          }
        }
      } else {
        const nestedName = capitalizeFirst(key);
        if (!processedClasses.has(nestedName)) {
          processedClasses.add(nestedName);
          codes.push({
            name: nestedName,
            fileName: toSnakeCase(nestedName),
            entityCode: generateEntityClass(value, nestedName, false),
            modelCode: generateModelClass(value, nestedName, false)
          });
          collectNestedObjects(value);
        }
      }
    }
  };

  collectNestedObjects(jsonData);
  return codes;
};


const indent = (level: number) => ' '.repeat(level * 2);

export const getEntityDartType = (value: any, key: string = ''): string => {
  if (value === null) return 'dynamic';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'List<dynamic>';
    const firstItem = value[0];

    // Xử lý List of primitives
    if (typeof firstItem === 'string') return 'List<String>';
    if (typeof firstItem === 'number') return Number.isInteger(firstItem) ? 'List<int>' : 'List<double>';
    if (typeof firstItem === 'boolean') return 'List<bool>';

    // Xử lý List of objects
    if (typeof firstItem === 'object') {
      return `List<${capitalizeFirst(key.replace(/s$/, ''))}Entity>`;
    }

    return 'List<dynamic>';
  }

  // Xử lý object
  if (typeof value === 'object' && value !== null) {
    return `${capitalizeFirst(key)}Entity`;
  }

  switch (typeof value) {
    case 'string': return 'String';
    case 'number': return Number.isInteger(value) ? 'int' : 'double';
    case 'boolean': return 'bool';
    default: return 'dynamic';
  }
};

export const generateEntityClass = (obj: any, name: string, isRoot: boolean = false): string => {
  const capitalizedName = capitalizeFirst(name);
  let entityClass = `import 'package:equatable/equatable.dart';\n`;

  entityClass += `\nclass ${capitalizedName}Entity extends Equatable {\n`;

  // Properties
  Object.entries(obj).forEach(([key, value]) => {
    let dartType;
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        const itemName = capitalizeFirst(key.replace(/s$/, ''));
        dartType = `List<${itemName}Entity>`;
      } else {
        dartType = getEntityDartType(value, key);
      }
    } else if (typeof value === 'object' && value !== null) {
      dartType = `${capitalizeFirst(key)}Entity`;
    } else {
      dartType = getEntityDartType(value, key);
    }
    entityClass += `  final ${dartType} ${key};\n`;
  });

  // Constructor
  entityClass += `\n  const ${capitalizedName}Entity({\n`;
  Object.keys(obj).forEach(key => {
    entityClass += `    required this.${key},\n`;
  });
  entityClass += `  });\n\n`;

  // Props for Equatable
  entityClass += `  @override\n  List<Object?> get props {\n    return [\n`;
  Object.keys(obj).forEach(key => {
    entityClass += `      ${key},\n`;
  });
  entityClass += `    ];\n  }\n\n`;

  // copyWith method
  entityClass += `  ${capitalizedName}Entity copyWith({\n`;
  Object.entries(obj).forEach(([key, value]) => {
    let dartType;
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        const itemName = capitalizeFirst(key.replace(/s$/, ''));
        dartType = `List<${itemName}Entity>`;
      } else {
        dartType = getEntityDartType(value, key);
      }
    } else if (typeof value === 'object' && value !== null) {
      dartType = `${capitalizeFirst(key)}Entity`;
    } else {
      dartType = getEntityDartType(value, key);
    }
    entityClass += `    ${dartType}? ${key},\n`;
  });
  entityClass += `  }) {\n`;
  entityClass += `    return ${capitalizedName}Entity(\n`;
  Object.keys(obj).forEach(key => {
    entityClass += `      ${key}: ${key} ?? this.${key},\n`;
  });
  entityClass += `    );\n`;
  entityClass += `  }\n`;

  entityClass += `}\n`;

  return entityClass;
};

export const generateModelClass = (obj: any, name: string, isRoot: boolean = false): string => {
  const capitalizedName = capitalizeFirst(name);
  let modelClass = `import '${name.toLowerCase()}_entity.dart';\n`;
  modelClass += `\nclass ${capitalizedName}Model extends ${capitalizedName}Entity {\n`;

  // Constructor
  modelClass += `  const ${capitalizedName}Model({\n`;
  Object.entries(obj).forEach(([key, value]) => {
    let dartType;
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        const itemName = capitalizeFirst(key.replace(/s$/, ''));
        dartType = `List<${itemName}Model>`;
      } else {
        dartType = getEntityDartType(value, key);
      }
    } else if (typeof value === 'object' && value !== null) {
      dartType = `${capitalizeFirst(key)}Model`;
    } else {
      dartType = getEntityDartType(value, key);
    }
    modelClass += `    ${dartType}? ${key},\n`;
  });
  modelClass += `${indent(1)}}) : super(\n`;

  // Super call với indent cố định 10 spaces
  Object.entries(obj).forEach(([key, value]) => {
    const defaultValue = getDefaultValue(value, key);
    modelClass += `${' '.repeat(10)}${key}: ${key} ?? ${defaultValue},\n`;
  });
  modelClass += `${indent(4)});\n\n`;

  // fromJson factory
  modelClass += `  factory ${capitalizedName}Model.fromJson(Map<String, dynamic> json) {\n`;
  modelClass += `    return ${capitalizedName}Model(\n`;

  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        modelClass += `      ${key}: json['${key}'] as List<dynamic>?,\n`;
      } else if (typeof value[0] === 'string') {
        modelClass += `      ${key}: (json['${key}'] as List<dynamic>?)?.cast<String>(),\n`;
      } else if (typeof value[0] === 'number') {
        const type = Number.isInteger(value[0]) ? 'int' : 'double';
        modelClass += `      ${key}: (json['${key}'] as List<dynamic>?)?.cast<${type}>(),\n`;
      } else if (typeof value[0] === 'boolean') {
        modelClass += `      ${key}: (json['${key}'] as List<dynamic>?)?.cast<bool>(),\n`;
      } else if (typeof value[0] === 'object') {
        const itemType = capitalizeFirst(key.replace(/s$/, ''));
        modelClass += `      ${key}: (json['${key}'] as List<dynamic>?)\n`;
        modelClass += `          ?.map((e) => ${itemType}Model.fromJson(e as Map<String, dynamic>))\n`;
        modelClass += `          .toList(),\n`;
      }
    } else if (typeof value === 'object' && value !== null) {
      const type = capitalizeFirst(key);
      modelClass += `      ${key}: json['${key}'] == null\n`;
      modelClass += `          ? null\n`;
      modelClass += `          : ${type}Model.fromJson(\n`;
      modelClass += `              json['${key}'] as Map<String, dynamic>,\n`;
      modelClass += `            ),\n`;
    } else {
      const dartType = getEntityDartType(value);
      modelClass += `      ${key}: json['${key}'] as ${dartType}?,\n`;
    }
  });

  modelClass += `    );\n`;
  modelClass += `  }\n`;
  modelClass += `}\n`;

  return modelClass;
};

const getDefaultValue = (value: any, key: string): string => {
  if (Array.isArray(value)) {
    // Default value cho List
    if (value.length === 0 || typeof value[0] !== 'object') {
      return 'const []';
    }
    return `const []`;
  }
  if (typeof value === 'object' && value !== null) {
    return `${capitalizeFirst(key)}Model()`;
  }
  switch (typeof value) {
    case 'string': return '""';
    case 'number': return '0';
    case 'boolean': return 'false';
    default: return 'null';
  }
};
