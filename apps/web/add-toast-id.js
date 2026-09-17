export default function transformer(file, api) {
	const j = api.jscodeshift.withParser("tsx");

	return j(file.source)
		.find(j.CallExpression, {
			callee: {
				type: "MemberExpression",
				object: {
					name: "toast",
				},
			},
		})
		.forEach((path) => {
			const args = path.node.arguments;

			const alreadyHasOptions =
				args.length > 1 &&
				args[1].type === "ObjectExpression" &&
				args[1].properties.some(
					(prop) =>
						prop.key?.name === "toasterId" || prop.key?.value === "toasterId",
				);

			if (!alreadyHasOptions) {
				args.push(
					j.objectExpression([
						j.objectProperty(j.identifier("toasterId"), j.literal("global")),
					]),
				);
			}
		})
		.toSource();
}
