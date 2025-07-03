import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Credenza,
  CredenzaContent,
  CredenzaTrigger,
  CredenzaFooter,
} from "@repo/ui/components/ui/credenza";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormField,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { RotateCcw } from "lucide-react";
import { SlidersHorizontal } from "lucide-react";
import { z } from "zod";

const formSchema = z
  .object({
    address: z.string().min(1, {
      message: "Address is required.",
    }),
    min: z.coerce
      .number({
        invalid_type_error: "Minimum value must be a number.",
      })
      .optional(),
    max: z.coerce
      .number({
        invalid_type_error: "Maximum value must be a number.",
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.max > data.min;
      }
      return true;
    },
    {
      message: "Maximum value must be greater than minimum value.",
      path: ["max"],
    },
  );

export default function FilterByAddressModal() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      min: undefined,
      max: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <SlidersHorizontal className="h-4 w-4" />
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
        {/* <CredenzaHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between"> */}
        {/*   <CredenzaTitle className="text-white"> */}
        {/*     Account and Security */}
        {/*   </CredenzaTitle> */}
        {/* </CredenzaHeader> */}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-4 py-8"
          >
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Maker Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter maker address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Min. USD</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter min USD"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? undefined
                              : Number.parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Max. USD</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter max USD"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? undefined
                              : Number.parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CredenzaFooter className="grid grid-cols-2 mt-0 gap-4 items-center w-full">
              <Button
                variant="ghost"
                size="lg"
                className="w-full rounded-full items-center"
              >
                <RotateCcw />
                Reset
              </Button>
              <Button
                variant="default"
                size="lg"
                className="w-full rounded-full"
              >
                Apply
              </Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
}
