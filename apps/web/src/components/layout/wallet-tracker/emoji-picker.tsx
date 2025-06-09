// "use client";
// import { EmojiPicker } from "@ferrucc-io/emoji-picker";
// import { Button } from "@repo/ui/components/ui/button";
// import {
//   EmojiPickerSearch,
//   EmojiPickerContent,
//   EmojiPickerFooter,
// } from "@repo/ui/components/ui/emoji-picker";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@repo/ui/components/ui/popover";
//
// export default function Page() {
//   const [isOpen, setIsOpen] = React.useState(false);
//
//   return (
//     <main className="flex h-full min-h-screen w-full items-center justify-center p-4">
//       <Popover onOpenChange={setIsOpen} open={isOpen}>
//         <PopoverTrigger asChild>
//           <Button >Open emoji picker</Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-fit p-0">
//           <EmojiPicker
//             className="h-[342px]"
//             onEmojiSelect={({ emoji }) => {
//               setIsOpen(false);
//               console.log(emoji);
//             }}
//           >
//             <EmojiPickerSearch />
//             <EmojiPickerContent />
//             <EmojiPickerFooter />
//           </EmojiPicker>
//         </PopoverContent>
//       </Popover>
//     </main>
//   );
// }
