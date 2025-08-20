//as the BTreeNodeComponent is not used but used 
// import { motion } from "framer-motion";
// import { type BTreeNode } from "../../interfaces/interfaces";
// interface BTreeNodeProps {
//     node: BTreeNode;
//     highlight?: boolean;
// }

// export const BTreeNodeComponent = ({ node, highlight }: BTreeNodeProps) => {
//     return (
//         <motion.div
//             className={`flex flex-col items-center p-2 m-1 rounded-lg border-2 ${highlight ? "bg-yellow-200 border-red-500" : "bg-white border-gray-300"
//                 }`}
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.5, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 300 }}
//         >
//             {/* Keys */}
//             <div className="flex space-x-1">
//                 {node.keys.map((key, i) => (
//                     <motion.div
//                         key={i}
//                         className="px-3 py-1 bg-blue-100 rounded-md shadow-sm"
//                         whileHover={{ scale: 1.1 }}
//                     >
//                         {key}
//                     </motion.div>
//                 ))}
//             </div>

//             {/* Children */}
//             {node.children && (
//                 <div className="flex mt-2 space-x-4">
//                     {node.children.map((child, i) => (
//                         <BTreeNodeComponent key={i} node={child} />
//                     ))}
//                 </div>
//             )}
//         </motion.div>
//     );
// };