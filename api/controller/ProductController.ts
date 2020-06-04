import Controller from "../tools/Controller";
import Product, {ProductDocument} from "../models/Product";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping} from "../desc";
import {Context} from "koa";


@GetMapping("products")
export class ProductController extends Controller<ProductDocument> {
  @Inject(Product)
  Model:any

  @PostMapping("")
  async create(ctx: Context): Promise<void> {
    await super.create(ctx);
  }

  @DeleteMapping(":id")
  async destroy(ctx: Context): Promise<void> {
    await super.destroy(ctx);
  }

  @PutMapping(":id")
  async update(ctx: Context): Promise<void> {
    await super.update(ctx);
  }

  @GetMapping(":id")
  async show(ctx: Context): Promise<void> {
    await super.show(ctx);
  }

  @GetMapping("")
  async index(ctx: Context): Promise<void> {
    await super.index(ctx);
  }
}